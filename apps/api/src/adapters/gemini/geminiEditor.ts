import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { config } from "../../config/env.js";

const NarrationOutputSchema = z.object({
  title: z.string().max(28),
  line: z.string().max(90),
  reasons: z.array(z.string().max(60)).min(2).max(3),
});

export type NarrationOutput = z.infer<typeof NarrationOutputSchema>;

const MOOD_LABELS: Record<string, string> = {
  empty: "비움과 고요",
  walk: "호젓한 산책",
  discover: "새로운 발견",
  stay: "머무는 쉼",
};

/**
 * Deterministic fallback template (Handoff section 19)
 */
export function getTemplateNarration(
  placeName: string,
  stayMinutes: number,
  mood: string,
  areaName: string,
  facts: string[]
): NarrationOutput {
  const currentHour = new Date().getHours();
  let timeContext = "도심 속 조용한 시간";
  if (currentHour >= 20 || currentHour < 6) {
    timeContext = "인적이 잦아든 밤";
  } else if (currentHour >= 18) {
    timeContext = "퇴근길 불빛 아래";
  } else if (currentHour >= 12 && currentHour <= 14) {
    timeContext = "한낮의 분주함을 피해";
  } else if (currentHour < 10) {
    timeContext = "차분한 아침 공기 속";
  }

  return {
    title: `${timeContext}, ${placeName} ${stayMinutes}분`,
    line: `${areaName}에서 서두르지 않고 온전히 나에게 집중하는 ${stayMinutes}분의 완결된 틈입니다.`,
    reasons: facts.slice(0, 3),
  };
}

/**
 * Check if output contains forbidden marketing buzzwords (Handoff section 19)
 */
function cleanProhibitedWords(text: string): string {
  const prohibited = ["힐링", "핫플", "인생샷", "완벽한", "대박", "강추", "최고의"];
  let cleaned = text;
  for (const word of prohibited) {
    cleaned = cleaned.replaceAll(word, "좋은");
  }
  return cleaned;
}

let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI | null {
  if (!aiClient && config.gemini.apiKey && config.gemini.apiKey !== "replace_me") {
    aiClient = new GoogleGenAI({ apiKey: config.gemini.apiKey });
  }
  return aiClient;
}

/**
 * Generate editorial narration with strict timeout and fallback
 */
export async function generateEditorialNarration(params: {
  placeName: string;
  areaName: string;
  mood: string;
  stayMinutes: number;
  outboundMinutes: number;
  returnMinutes: number;
  safetyBufferMinutes: number;
  crowdLevel: string;
  costWon: number;
  facts: string[];
}): Promise<NarrationOutput> {
  const fallback = getTemplateNarration(
    params.placeName,
    params.stayMinutes,
    params.mood,
    params.areaName,
    params.facts
  );

  if (!config.gemini.enabled) {
    return fallback;
  }

  const ai = getAiClient();
  if (!ai) {
    return fallback;
  }

  const systemInstruction = `당신은 모바일 서비스 《틈》의 에디터다.
《틈》은 남는 시간을 살아본 시간으로 바꾸는 서울의 시간 설계 지도다.

반드시 제공된 FACTS만 사용한다.
장소, 행사, 시간, 가격, 거리, 혼잡도, 날씨를 추측하거나 추가하지 않는다.
사실이 부족하면 과장하지 않고 중립적으로 쓴다.

문체는 조용하고 도시적이며 군더더기 없다.
관광 광고, 감탄사, 과도한 형용사, '힐링', '핫플', '인생샷', '완벽한'을 절대 사용하지 않는다.
'20분의 호젓한 산책'과 같은 막연한 감성 카피는 절대 금지한다.
반드시 "왜 지금 이 장소여야 하는가(시간대/도심 상황 맥락)"와 장소의 본질이 제목에 느껴지도록 작성하라.
예: '불 꺼진 빌딩 숲 사이, 환구단 앞 20분의 고요', '정오의 북적임을 피해 걷는, 덕수궁 돌담길 25분', '퇴근길 도심 속 숨 고르기, 일원목련공원 35분의 틈'

반드시 아래 JSON 포맷으로만 응답하라:
{
  "title": "24자 이내의 시간과 장소의 필연성이 담긴 제목",
  "line": "80자 이내의 조용한 한 문장 소개",
  "reasons": ["2~3개의 사실 기반 추천 이유"]
}`;

  const prompt = JSON.stringify({
    user_context: {
      mood: params.mood,
      stay_minutes: params.stayMinutes,
    },
    facts: {
      place_name: params.placeName,
      area_name: params.areaName,
      outbound_minutes: params.outboundMinutes,
      stay_minutes: params.stayMinutes,
      return_minutes: params.returnMinutes,
      safety_buffer_minutes: params.safetyBufferMinutes,
      crowd_level: params.crowdLevel,
      cost_won: params.costWon,
      verified_facts: params.facts,
    },
  });

  try {
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Gemini timeout")), config.gemini.timeoutMs)
    );

    const callPromise = ai.models.generateContent({
      model: config.gemini.model,
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
      },
    });

    const response = await Promise.race([callPromise, timeoutPromise]);
    const responseText = response.text ? response.text.trim() : "";
    if (!responseText) return fallback;

    const parsed = JSON.parse(responseText);
    const validated = NarrationOutputSchema.parse({
      title: cleanProhibitedWords(parsed.title),
      line: cleanProhibitedWords(parsed.line),
      reasons: (parsed.reasons || []).map((r: string) => cleanProhibitedWords(r)),
    });

    return validated;
  } catch {
    // Graceful fallback to deterministic template on any error or timeout
    return fallback;
  }
}
