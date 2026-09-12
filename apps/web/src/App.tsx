import { useState, useEffect } from "react";
import { Mood, RecommendationItem } from "@tteum/contracts";
import S01Splash from "./screens/S01Splash.js";
import S02TimeInput from "./screens/S02TimeInput.js";
import S03MoodInput from "./screens/S03MoodInput.js";
import S04RecommendationMap from "./screens/S04RecommendationMap.js";
import S05TteumDetail from "./screens/S05TteumDetail.js";
import S06ActiveSession from "./screens/S06ActiveSession.js";
import S07Reflection from "./screens/S07Reflection.js";
import {
  LoadingView,
  EmptyResultView,
  LocationPermissionView,
  ErrorStateView,
} from "./components/StateViews.js";
import {
  getRecommendations,
  startSessionApi,
  completeSessionApi,
  abandonSessionApi,
  reverseGeocodeApi,
} from "./lib/api.js";
import { getAnonymousId, getReclaimedMinutes, addReclaimedMinutes } from "./lib/storage.js";

type ScreenState =
  | "splash"
  | "time"
  | "mood"
  | "loading"
  | "recommendation"
  | "detail"
  | "active"
  | "reflection"
  | "empty"
  | "permission"
  | "error";

export default function App() {
  const queryParams = new URLSearchParams(window.location.search);
  const initialScreen = (queryParams.get("screen") as ScreenState) || "splash";

  const [currentScreen, setCurrentScreen] = useState<ScreenState>(initialScreen);
  const [gapMinutes, setGapMinutes] = useState<number>(60);
  const [mood, setMood] = useState<Mood>("empty");

  // Location state: Default to Seoul City Hall
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number }>({
    lat: 37.5663,
    lng: 126.9779,
  });
  const [areaLabel, setAreaLabel] = useState<string>("서울시청·광화문");

  // Recommendation & Session states
  const sampleRec: RecommendationItem = {
    id: "deoksugung-stonewall",
    title: "31분의 고요",
    line: "사람이 적은 돌담길을 천천히 걷고 돌아옵니다.",
    place: {
      name: "덕수궁 돌담길",
      lat: 37.5658,
      lng: 126.9752,
      type: "walk",
      areaName: "시청·서소문",
      indoor: false,
      estimatedCostWon: 0,
    },
    timeline: {
      outboundMinutes: 7,
      stayMinutes: 31,
      returnMinutes: 12,
      safetyBufferMinutes: 10,
      totalMinutes: 60,
    },
    facts: ["현재 주변 혼잡도가 여유롭습니다.", "예상 비용 없이 무료로 이용 가능합니다."],
    validUntil: new Date(Date.now() + 60 * 60000).toISOString(),
    score: 0.88,
    sourceUpdatedAt: "2026-09-12T18:12:00+09:00",
    crowdLevel: "relaxed",
  };

  const sampleRec2: RecommendationItem = {
    id: "jeongdong-observatory",
    title: "25분의 조망",
    line: "서소문청사 13층에서 덕수궁 전경을 바라보며 잠시 머뭅니다.",
    place: {
      name: "정동전망대",
      lat: 37.5645,
      lng: 126.9749,
      type: "view",
      areaName: "시청·서소문",
      indoor: true,
      estimatedCostWon: 3500,
    },
    timeline: {
      outboundMinutes: 8,
      stayMinutes: 25,
      returnMinutes: 14,
      safetyBufferMinutes: 10,
      totalMinutes: 57,
    },
    facts: ["도심 속 안정적인 휴식이 가능합니다.", "출발 및 복귀를 포함해 57분 안에 완결됩니다."],
    validUntil: new Date(Date.now() + 57 * 60000).toISOString(),
    score: 0.82,
    sourceUpdatedAt: "2026-09-12T18:12:00+09:00",
    crowdLevel: "normal",
  };

  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([sampleRec, sampleRec2]);
  const [selectedRecommendation, setSelectedRecommendation] = useState<RecommendationItem | null>(sampleRec);
  const [dataStatus, setDataStatus] = useState<"live" | "stale" | "demo">("live");
  const [activeSessionId, setActiveSessionId] = useState<string | null>("sess_demo");
  const [actualMinutesSpent, setActualMinutesSpent] = useState<number>(45);
  const [totalSavedMinutes, setTotalSavedMinutes] = useState<number>(105);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [previousScreen, setPreviousScreen] = useState<ScreenState>("time");

  const requestLocation = (showPermissionOnError = false) => {
    if (!("geolocation" in navigator)) {
      setLocationError("사용 중인 브라우저가 위치 정보 기능을 지원하지 않습니다.");
      if (showPermissionOnError) {
        setPreviousScreen(currentScreen);
        setCurrentScreen("permission");
      }
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        setIsLocating(false);
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setUserLocation({ lat, lng });
        setLocationError(null);

        try {
          const geo = await reverseGeocodeApi(lat, lng);
          if (geo?.label && geo.label !== "현재 위치") {
            setAreaLabel(geo.label);
          } else {
            setAreaLabel("현재 위치");
          }
        } catch {
          setAreaLabel("현재 위치");
        }
      },
      (err) => {
        setIsLocating(false);
        let msg = "위치 정보를 가져올 수 없습니다.";
        if (err.code === 1) {
          msg = "브라우저 위치 권한이 차단되어 있습니다. 주소창 좌측 설정/자물쇠 아이콘에서 [위치]를 허용해 주세요.";
        } else if (err.code === 2) {
          msg = "현재 위치 신호(GPS/Wi-Fi)를 수신할 수 없습니다. macOS [시스템 설정 > 위치 서비스]를 확인해 주세요.";
        } else if (err.code === 3) {
          msg = "위치 탐색 시간이 초과되었습니다 (10초). 신호가 안정적인 곳에서 다시 시도하거나 직접 권역을 선택해 주세요.";
        }
        setLocationError(msg);
        if (showPermissionOnError) {
          setPreviousScreen(currentScreen);
          setCurrentScreen("permission");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  useEffect(() => {
    setTotalSavedMinutes(getReclaimedMinutes());
    requestLocation(false);
  }, []);

  const currentTimeStr = new Date().toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const handleFetchRecommendations = async () => {
    setCurrentScreen("loading");
    try {
      const response = await getRecommendations({
        location: userLocation,
        gapMinutes,
        mood,
        now: new Date().toISOString(),
      });

      setDataStatus(response.dataStatus);

      if (response.recommendations.length === 0) {
        setCurrentScreen("empty");
      } else {
        setRecommendations(response.recommendations);
        setCurrentScreen("recommendation");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "추천 정보를 불러오는 중 문제가 발생했습니다.");
      setCurrentScreen("error");
    }
  };

  const handleStartSession = async (item: RecommendationItem) => {
    setSelectedRecommendation(item);
    const anonId = getAnonymousId();

    try {
      const res = await startSessionApi({
        recommendationId: item.id,
        placeId: item.place.name,
        placeName: item.place.name,
        predictedMinutes: item.timeline.totalMinutes,
        anonymousId: anonId,
      });
      setActiveSessionId(res.sessionId);
    } catch {
      // Offline or mock fallback session ID
      setActiveSessionId("local_" + Date.now());
    }

    setCurrentScreen("active");
  };

  const handleCompleteSession = async (minutes: number) => {
    setActualMinutesSpent(minutes);
    const updatedTotal = addReclaimedMinutes(minutes);
    setTotalSavedMinutes(updatedTotal);

    if (activeSessionId) {
      try {
        await completeSessionApi(activeSessionId, {
          actualMinutes: minutes,
          reflection: "okay",
          anonymousId: getAnonymousId(),
        });
      } catch {
        // Silent fail for offline prototype
      }
    }
    setCurrentScreen("reflection");
  };

  const handleAbandonSession = async (elapsedMinutes: number, reason: any) => {
    if (activeSessionId) {
      try {
        await abandonSessionApi(activeSessionId, {
          elapsedMinutes,
          reason,
          anonymousId: getAnonymousId(),
        });
      } catch {
        // Silent fail
      }
    }
    // Return to time input quietly
    setCurrentScreen("time");
  };

  return (
    <div className="app-container">
      {currentScreen === "splash" && (
        <S01Splash
          onStart={() => {
            requestLocation(false);
            setCurrentScreen("time");
          }}
        />
      )}

      {currentScreen === "time" && (
        <S02TimeInput
          areaLabel={areaLabel}
          currentTimeStr={currentTimeStr}
          gapMinutes={gapMinutes}
          onGapMinutesChange={setGapMinutes}
          onNext={() => setCurrentScreen("mood")}
          onLocationClick={() => {
            setPreviousScreen("time");
            setCurrentScreen("permission");
          }}
          isLocating={isLocating}
        />
      )}

      {currentScreen === "mood" && (
        <S03MoodInput
          areaLabel={areaLabel}
          currentTimeStr={currentTimeStr}
          gapMinutes={gapMinutes}
          mood={mood}
          onMoodChange={setMood}
          onBack={() => setCurrentScreen("time")}
          onSubmit={handleFetchRecommendations}
          onLocationClick={() => {
            setPreviousScreen("mood");
            setCurrentScreen("permission");
          }}
          isLocating={isLocating}
        />
      )}

      {currentScreen === "loading" && <LoadingView />}

      {currentScreen === "recommendation" && (
        <S04RecommendationMap
          userLocation={userLocation}
          areaLabel={areaLabel}
          gapMinutes={gapMinutes}
          recommendations={recommendations}
          dataStatus={dataStatus}
          onBack={() => setCurrentScreen("mood")}
          onSelectDetail={(item) => {
            setSelectedRecommendation(item);
            setCurrentScreen("detail");
          }}
        />
      )}

      {currentScreen === "detail" && selectedRecommendation && (
        <S05TteumDetail
          item={selectedRecommendation}
          onBack={() => setCurrentScreen("recommendation")}
          onStartSession={handleStartSession}
        />
      )}

      {currentScreen === "active" && selectedRecommendation && (
        <S06ActiveSession
          item={selectedRecommendation}
          onComplete={handleCompleteSession}
          onAbandon={handleAbandonSession}
        />
      )}

      {currentScreen === "reflection" && (
        <S07Reflection
          actualMinutes={actualMinutesSpent}
          totalSavedMinutes={totalSavedMinutes}
          onSubmitReflection={() => {}}
          onGoHome={() => setCurrentScreen("time")}
        />
      )}

      {currentScreen === "empty" && (
        <EmptyResultView onReset={() => setCurrentScreen("time")} />
      )}

      {currentScreen === "permission" && (
        <LocationPermissionView
          onSelectArea={(area) => {
            setUserLocation({ lat: area.lat, lng: area.lng });
            setAreaLabel(area.name);
            setLocationError(null);
            setCurrentScreen(previousScreen || "time");
          }}
          onRetryGps={() => requestLocation(true)}
          isLocating={isLocating}
          locationError={locationError}
          onClose={() => setCurrentScreen(previousScreen || "time")}
        />
      )}

      {currentScreen === "error" && (
        <ErrorStateView
          message={errorMessage}
          onRetry={handleFetchRecommendations}
        />
      )}
    </div>
  );
}
