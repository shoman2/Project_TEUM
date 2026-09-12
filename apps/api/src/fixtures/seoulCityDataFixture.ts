import { SeoulCitySnapshot } from "@tteum/contracts";

export const SEOUL_CITYDATA_FIXTURES: Record<string, SeoulCitySnapshot> = {
  "서울광장·시청": {
    areaName: "서울광장·시청",
    capturedAt: "2026-09-12T18:10:00+09:00",
    population: {
      level: "relaxed",
      min: 12000,
      max: 14000,
      message: "사람들이 여유롭게 머무르고 있습니다.",
    },
    weather: {
      temperatureC: 22.5,
      precipitationType: "none",
      precipitationMessage: "비 예보 없음",
      pm25: 14,
      pm10: 28,
    },
    events: [
      {
        title: "2026 책읽는 서울광장 야외도서관",
        place: "서울광장",
        date: "2026-04-18~2026-10-31",
      },
    ],
    source: "seoul-citydata",
    stale: false,
  },
  "광화문": {
    areaName: "광화문",
    capturedAt: "2026-09-12T18:10:00+09:00",
    population: {
      level: "normal",
      min: 24000,
      max: 28000,
      message: "보행 흐름이 원활합니다.",
    },
    weather: {
      temperatureC: 22.4,
      precipitationType: "none",
      precipitationMessage: "쾌적한 날씨",
      pm25: 15,
      pm10: 30,
    },
    events: [
      {
        title: "광화문 책마당 야외 북라운지",
        place: "광화문광장 육조마당",
        date: "2026-04-01~2026-10-31",
      },
    ],
    source: "seoul-citydata",
    stale: false,
  },
  "을지로": {
    areaName: "을지로",
    capturedAt: "2026-09-12T18:10:00+09:00",
    population: {
      level: "relaxed",
      min: 15000,
      max: 18000,
      message: "주변 통행이 비교적 여유롭습니다.",
    },
    weather: {
      temperatureC: 22.6,
      precipitationType: "none",
      precipitationMessage: "맑음",
      pm25: 16,
      pm10: 32,
    },
    events: [],
    source: "seoul-citydata",
    stale: false,
  },
};
