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
  stayMinutes: number,
  mood: string,
  areaName: string,
  facts: string[]
): NarrationOutput {
  const moodLabel = MOOD_LABELS[mood] || "호젓한 틈";
  return {
    title: `${stayMinutes}분의 ${moodLabel}`,
    line: `${areaName}에서 서두르지 않고 지금 온전히 완결되는 짧은 시간입니다.`,
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

문체는 조용하고 도시적이며 짧다.
관광 광고, 감탄사, 과도한 형용사, '힐링', '핫플', '인생샷', '완벽한'을 절대 사용하지 않는다.
장소명보다 사용자가 얻게 될 시간의 성격을 제목으로 쓴다 (예: '27분의 고요', '비를 피하는 38분').

반드시 아래 JSON 포맷으로만 응답하라:
{
  "title": "24자 이내의 경험 제목",
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
