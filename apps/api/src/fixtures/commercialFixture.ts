import { CommercialDistrict, NearbyCafe } from "@tteum/contracts";

export interface DistrictWithCafes {
  district: CommercialDistrict;
  cafes: Array<{
    id: string;
    name: string;
    category: string;
    lat: number;
    lng: number;
    address: string;
    signatureMenu: string;
    businessType: string;
    quietScore: string;
    openHours: string;
  }>;
}

export const COMMERCIAL_FIXTURES: Record<string, DistrictWithCafes> = {
  "강남구 일원동": {
    district: {
      districtName: "일원동 맛골목 골목상권",
      districtType: "골목상권 (서울시 상권분석 연계)",
      smallBusinessRatio: "소상공인 점포 비율 86%",
      vibeTag: "호젓한 주거골목 · 대모산 자락 쉼터",
      footTraffic: "낮 시간대 유동 4,800명/시간 (혼잡도 낮음)",
      densityMessage: "골목 단위 소상공인 독립 로스터리와 조용한 찻집 밀집",
    },
    cafes: [
      {
        id: "cafe-teum-ilwon",
        name: "카페 틈 일원 (로컬 로스터리)",
        category: "독립 로스터리",
        lat: 37.4845,
        lng: 127.0850,
        address: "서울 강남구 일원로9길 14",
        signatureMenu: "에티오피아 예가체프 핸드드립 (4,500원)",
        businessType: "소상공인 독립점포",
        quietScore: "조용함 (1인 좌석 보유)",
        openHours: "08:30 ~ 21:30",
      },
      {
        id: "daemosan-solbaram-tea",
        name: "대모산 솔바람 다원(茶院)",
        category: "전통 찻집",
        lat: 37.4828,
        lng: 127.0862,
        address: "서울 강남구 광평로10길 22",
        signatureMenu: "지리산 수제 야생녹차 & 다식 (5,000원)",
        businessType: "소상공인 독립점포",
        quietScore: "아주 고요함 (다도 음악)",
        openHours: "10:00 ~ 21:00",
      },
      {
        id: "ilwon-mokryeon-bookcafe",
        name: "목련 북카페 & 쉼터",
        category: "북카페 & 쉼터",
        lat: 37.4851,
        lng: 127.0832,
        address: "서울 강남구 일원로5길 8",
        signatureMenu: "바닐라빈 라떼 & 구움과자 (5,000원)",
        businessType: "소상공인 독립점포",
        quietScore: "조용함 (독서 특화)",
        openHours: "09:00 ~ 21:00",
      },
      {
        id: "maru-bakery-atelier",
        name: "마루 사워도우 베이커리 카페",
        category: "동네 디저트 공방",
        lat: 37.4905,
        lng: 127.0845,
        address: "서울 강남구 양재대로55길 9",
        signatureMenu: "천연발효 깜빠뉴 & 아메리카노 (4,800원)",
        businessType: "소상공인 독립점포",
        quietScore: "아늑함",
        openHours: "09:00 ~ 20:30",
      },
    ],
  },
  "시청·서소문": {
    district: {
      districtName: "정동·서소문 역사문화 골목상권",
      districtType: "골목상권 (서울시 상권분석 연계)",
      smallBusinessRatio: "소상공인 점포 비율 82%",
      vibeTag: "역사문화 보행로 · 직장인 틈새 사색",
      footTraffic: "점심 이후 여유 유동 6,200명/시간",
      densityMessage: "덕수궁 돌담길 배후 독립 에스프레소 바 및 갤러리 카페",
    },
    cafes: [
      {
        id: "jeongdong-dawan",
        name: "정동 다원 (덕수궁 돌담 찻집)",
        category: "전통 찻집",
        lat: 37.5652,
        lng: 126.9740,
        address: "서울 중구 덕수궁길 15",
        signatureMenu: "문경 오미자차 & 개성모약과 (5,500원)",
        businessType: "소상공인 독립점포",
        quietScore: "조용함 (돌담길 뷰)",
        openHours: "09:30 ~ 21:00",
      },
      {
        id: "seosomun-artisan-coffee",
        name: "서소문 아티장 에스프레소 바",
        category: "로컬 에스프레소 바",
        lat: 37.5640,
        lng: 126.9755,
        address: "서울 중구 서소문로11길 19",
        signatureMenu: "스트라파짜토 에스프레소 (3,500원)",
        businessType: "소상공인 독립점포",
        quietScore: "대화 적당 (스탠딩/좌석)",
        openHours: "08:00 ~ 20:00",
      },
      {
        id: "rousseau-lab-jeongdong",
        name: "루소랩 정동 독립 로스터리",
        category: "독립 로스터리",
        lat: 37.5670,
        lng: 126.9725,
        address: "서울 중구 정동길 17",
        signatureMenu: "정동 블렌드 싱글오리진 드립 (5,000원)",
        businessType: "소상공인 독립점포",
        quietScore: "여유로움",
        openHours: "08:30 ~ 20:30",
      },
    ],
  },
  "서울광장·시청": {
    district: {
      districtName: "소공·북창 도심형 골목상권",
      districtType: "골목상권 (서울시 상권분석 연계)",
      smallBusinessRatio: "소상공인 점포 비율 84%",
      vibeTag: "도심 속 숨은 골목 · 노포 로스터리",
      footTraffic: "시간당 7,500명 유동 (도심 중심부)",
      densityMessage: "시청 광장 뒤편 골목길 소상공인 드립 전문점 다수",
    },
    cafes: [
      {
        id: "hwangudan-alley-roastery",
        name: "환구단 골목 로스터스",
        category: "독립 로스터리",
        lat: 37.5648,
        lng: 126.9805,
        address: "서울 중구 소공로 106",
        signatureMenu: "과테말라 안티구아 핸드드립 (4,800원)",
        businessType: "소상공인 독립점포",
        quietScore: "조용함 (골목 안쪽)",
        openHours: "08:30 ~ 21:00",
      },
      {
        id: "cityhall-san-damiano",
        name: "산다미아노 정동 북카페",
        category: "북카페 & 쉼터",
        lat: 37.5662,
        lng: 126.9718,
        address: "서울 중구 정동길 9",
        signatureMenu: "공정무역 유기농 캐모마일 (4,500원)",
        businessType: "소상공인 독립점포",
        quietScore: "조용함 (잔잔한 클래식)",
        openHours: "09:00 ~ 21:00",
      },
    ],
  },
  "수서동": {
    district: {
      districtName: "수서 궁마을 힐링 골목상권",
      districtType: "골목상권 (서울시 상권분석 연계)",
      smallBusinessRatio: "소상공인 점포 비율 89%",
      vibeTag: "대모산 산자락 · 전원풍 힐링 골목",
      footTraffic: "시간당 3,900명 유동 (한적한 편)",
      densityMessage: "궁마을 숲길 따라 독립 티룸과 핸드드립 카페 위치",
    },
    cafes: [
      {
        id: "gungmaeul-pine-cafe",
        name: "궁마을 솔숲 로스터리",
        category: "독립 로스터리",
        lat: 37.4870,
        lng: 127.1015,
        address: "서울 강남구 광평로 206",
        signatureMenu: "솔향 수제 아인슈페너 (5,200원)",
        businessType: "소상공인 독립점포",
        quietScore: "조용함 (숲 전망)",
        openHours: "10:00 ~ 21:30",
      },
      {
        id: "suseo-dancheong-teahouse",
        name: "수서 단청 전통 다실",
        category: "전통 찻집",
        lat: 37.4882,
        lng: 127.1030,
        address: "서울 강남구 밤고개로1길 12",
        signatureMenu: "진한 쌍화차 & 수제 흑임자양갱 (5,500원)",
        businessType: "소상공인 독립점포",
        quietScore: "아주 고요함",
        openHours: "10:30 ~ 21:00",
      },
    ],
  },
  "삼성동": {
    district: {
      districtName: "삼성·포스코 뒷골목상권",
      districtType: "골목상권 (서울시 상권분석 연계)",
      smallBusinessRatio: "소상공인 점포 비율 78%",
      vibeTag: "테헤란로 이면도로 · 감성 로스터리",
      footTraffic: "시간당 8,900명 유동",
      densityMessage: "빌딩 숲 사이 숨겨진 소상공인 스페셜티 커피바",
    },
    cafes: [
      {
        id: "seonjeongneung-forest-gallery",
        name: "선정릉 숲 갤러리 카페",
        category: "독립 로스터리",
        lat: 37.5065,
        lng: 127.0515,
        address: "서울 강남구 테헤란로69길 16",
        signatureMenu: "플랫화이트 & 수제 브라우니 (5,000원)",
        businessType: "소상공인 독립점포",
        quietScore: "조용함",
        openHours: "08:30 ~ 21:00",
      },
    ],
  },
};
