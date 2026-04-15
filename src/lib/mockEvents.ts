import type { Event } from "./types";

// Three curated example events that surface on the home feed without needing
// a database. They also work as detail pages — `getMockEvent(id)` returns
// the matching event so `/events/[eventId]` can render them when the DB
// has no record.

const now = new Date();
const inDays = (days: number, hour = 19, minute = 0) => {
  const d = new Date(now);
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
};

export const MOCK_EVENTS: Event[] = [
  {
    id: "mock-indie-night",
    slug: "haven-indie-night",
    title: "Haven Indie Night vol.3 — 봄밤의 라이브",
    category: "인디음악",
    date: inDays(5, 19, 30),
    endTime: "오후 10:30",
    location: "서울 마포구 상수동",
    detailedAddress: "서울 마포구 와우산로 94 지하 1층",
    description:
      "다섯 팀의 인디 뮤지션이 모여 만드는 봄밤의 라이브. 따뜻한 통기타 사운드부터 시원한 밴드 셋까지, 한 번에 즐길 수 있는 작지만 알찬 공연이에요. 공연 후에는 아티스트와 자유롭게 인사 나눌 수 있는 미니 미트앤그릿 시간도 마련되어 있어요.",
    seatInfo: "자유석 60석 · 입장 순서대로 착석 · 스탠딩 구역 별도 운영",
    posterUrl: undefined,
    organizer: { name: "haven crew" },
    tickets: [
      {
        id: "mock-indie-night-t1",
        name: "얼리버드",
        price: 18000,
        totalQty: 30,
        soldQty: 27,
      },
      {
        id: "mock-indie-night-t2",
        name: "일반 입장",
        price: 25000,
        totalQty: 30,
        soldQty: 12,
      },
    ],
    extraQuestions: [
      {
        id: "mock-indie-night-q1",
        label: "한국어/영어 진행 선호",
        options: ["한국어 우선", "영어 환영", "상관 없음"],
      },
    ],
  },
  {
    id: "mock-pottery-class",
    slug: "weekend-pottery-class",
    title: "주말 도예 원데이클래스 — 나만의 머그잔 만들기",
    category: "원데이클래스",
    date: inDays(9, 14, 0),
    endTime: "오후 5:00",
    location: "서울 성동구 성수동",
    detailedAddress: "서울 성동구 연무장길 31 2층",
    description:
      "도예가 선생님과 함께 3시간 동안 나만의 머그잔을 직접 빚어보는 시간. 처음이어도 괜찮아요. 흙을 만지는 감각부터 차근차근 알려드려요. 굽기 작업이 끝난 컵은 2주 후 택배로 받아보실 수 있어요.",
    seatInfo: "회당 정원 6명 · 도구와 앞치마 제공",
    posterUrl: undefined,
    organizer: { name: "흙담 스튜디오" },
    tickets: [
      {
        id: "mock-pottery-t1",
        name: "1인 참여권",
        price: 55000,
        totalQty: 6,
        soldQty: 4,
      },
      {
        id: "mock-pottery-t2",
        name: "2인 동반권",
        price: 100000,
        totalQty: 3,
        soldQty: 1,
      },
    ],
    extraQuestions: [],
  },
  {
    id: "mock-language-exchange",
    slug: "seoul-language-exchange",
    title: "서울 랭귀지 익스체인지 — 한·영 모임 #14",
    category: "언어교환",
    date: inDays(2, 19, 0),
    endTime: "오후 10:00",
    location: "서울 용산구 이태원동",
    detailedAddress: "서울 용산구 이태원로 200 3층",
    description:
      "외국인 친구들과 가볍게 한국어/영어로 대화하는 캐주얼한 모임이에요. 매번 약 30명이 참여하고, 진행자가 그룹을 적절히 섞어드려요. 첫 참여자도 환영해요. 음료 한 잔 가격이 포함되어 있어요.",
    seatInfo: undefined,
    posterUrl: undefined,
    organizer: { name: "Seoul LX" },
    tickets: [
      {
        id: "mock-lx-t1",
        name: "참여권 (음료 1잔 포함)",
        price: 12000,
        totalQty: 30,
        soldQty: 18,
      },
    ],
    extraQuestions: [
      {
        id: "mock-lx-q1",
        label: "주로 사용하고 싶은 언어",
        options: ["한국어 (학습)", "영어 (학습)", "둘 다"],
      },
    ],
  },
];

export function getMockEvent(id: string): Event | null {
  return MOCK_EVENTS.find((e) => e.id === id) ?? null;
}

export function isMockEventId(id: string): boolean {
  return id.startsWith("mock-");
}
