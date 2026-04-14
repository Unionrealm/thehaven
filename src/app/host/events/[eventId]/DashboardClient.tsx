"use client";

import Link from "next/link";

interface DashboardData {
  id: string;
  slug: string;
  title: string;
  date: string;
  location: string;
  category: string;
  posterUrl?: string;
  totalSold: number;
  totalQty: number;
  totalRevenue: number;
  checkedInCount: number;
  recentPurchases: {
    id: string;
    buyerName: string;
    ticketName: string;
    checkedIn: boolean;
  }[];
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  const h = d.getHours();
  const ampm = h >= 12 ? "오후" : "오전";
  const hh = h > 12 ? h - 12 : h;
  return `${d.getMonth() + 1}월 ${d.getDate()}일 ${days[d.getDay()]}요일  ${ampm} ${hh}:${d.getMinutes().toString().padStart(2, "0")}`;
}

function getDday(dateStr: string) {
  const today = new Date();
  const eventDate = new Date(dateStr);
  const diff = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "D-Day";
  if (diff > 0) return `D-${diff}`;
  return `D+${Math.abs(diff)}`;
}

function formatRevenue(amount: number) {
  if (amount >= 1000000) return `₩${Math.floor(amount / 1000)}K`;
  return `₩${amount.toLocaleString("ko-KR")}`;
}

export default function DashboardClient({ event }: { event: DashboardData }) {
  const shareUrl = `https://haven.kr/e/${event.slug}`;
  const dday = getDday(event.date);

  function copyLink() {
    navigator.clipboard.writeText(shareUrl);
    alert("링크가 복사됐어요!");
  }

  function handleKakaoShare() {
    alert("카카오 공유 (SDK 연동 필요)");
  }

  return (
    <div className="pb-6">
      <div className="h-[10px] bg-[#f7f7f8]" />

      {/* Event summary card */}
      <div className="bg-white px-5 py-4">
        <div className="flex gap-4 mb-3">
          {/* Poster thumbnail */}
          <div className="w-14 h-14 bg-[#d6d0fc] rounded-[12px] shrink-0 overflow-hidden">
            {event.posterUrl && (
              <img src={event.posterUrl} alt="" className="w-full h-full object-cover" />
            )}
          </div>
          <div className="flex-1">
            <p className="text-[15px] font-semibold text-[#111] leading-tight">{event.title}</p>
            <p className="text-[12px] text-[#888] mt-1">{formatDate(event.date)}</p>
            <p className="text-[12px] text-[#888]">{event.location}</p>
            <div className="flex gap-1.5 mt-2">
              <span className="inline-flex items-center h-[22px] px-3 bg-[#fef6e4] rounded-[11px] text-[11px] font-medium text-[#f5a800]">
                판매중
              </span>
              <span className="inline-flex items-center h-[22px] px-3 bg-[#f0edff] rounded-[11px] text-[11px] font-medium text-[#5a42f5]">
                {dday}
              </span>
            </div>
          </div>
        </div>

        {/* Share URL */}
        <div className="flex items-center h-[26px] bg-[#f5f5f6] rounded-[8px] px-3">
          <span className="flex-1 text-[11px] text-[#aaaaaa] truncate">{shareUrl}</span>
          <button onClick={copyLink} className="text-[11px] font-medium text-[#5a42f5] shrink-0 ml-2">복사</button>
        </div>
      </div>

      <div className="h-[10px] bg-[#f7f7f8]" />

      {/* Stats */}
      <div className="bg-white px-5 py-4">
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-[#f5f5f6] rounded-[12px] px-3 py-4">
            <p className="text-[11px] font-medium text-[#aaaaaa] mb-1">판매 완료</p>
            <p className="text-[20px] font-bold text-[#5a42f5] tracking-[-0.5px]">{event.totalSold}석</p>
            <p className="text-[10px] text-[#aaaaaa] mt-1">{event.totalQty}석 중</p>
          </div>
          <div className="bg-[#f5f5f6] rounded-[12px] px-3 py-4">
            <p className="text-[11px] font-medium text-[#aaaaaa] mb-1">남은 자리</p>
            <p className="text-[20px] font-bold text-[#111] tracking-[-0.5px]">
              {event.totalQty - event.totalSold}석
            </p>
          </div>
          <div className="bg-[#f5f5f6] rounded-[12px] px-3 py-4">
            <p className="text-[11px] font-medium text-[#aaaaaa] mb-1">정산 예정</p>
            <p className="text-[20px] font-bold text-[#00c49a] tracking-[-0.5px]">
              {formatRevenue(event.totalRevenue)}
            </p>
            <p className="text-[10px] text-[#aaaaaa] mt-1">행사 후 정산</p>
          </div>
        </div>
      </div>

      <div className="h-[10px] bg-[#f7f7f8]" />

      {/* Quick actions */}
      <div className="bg-white px-5 py-4">
        <p className="text-[13px] font-semibold text-[#111] mb-3">빠른 작업</p>
        <div className="grid grid-cols-3 gap-2">
          <button onClick={copyLink} className="h-9 bg-[#5a42f5] rounded-[10px] text-[13px] font-medium text-white">
            링크 공유
          </button>
          <button onClick={handleKakaoShare} className="h-9 bg-[#ffe000] rounded-[10px] text-[13px] font-medium text-[#1a1200]">
            카카오 공유
          </button>
          <Link href={`/host/events/${event.id}/edit`} className="h-9 bg-[#f5f5f6] rounded-[10px] text-[13px] font-medium text-[#555] flex items-center justify-center">
            이벤트 수정
          </Link>
        </div>
      </div>

      <div className="h-[10px] bg-[#f7f7f8]" />

      {/* Buyer summary */}
      <div className="bg-white px-5 py-4">
        <p className="text-[15px] font-semibold text-[#111] mb-3">구매자 현황</p>

        {/* Progress bar */}
        <div className="h-1.5 bg-[#f0f0f0] rounded-[3px] mb-2">
          <div
            className="h-full bg-[#5a42f5] rounded-[3px] transition-all"
            style={{ width: `${event.totalQty > 0 ? (event.totalSold / event.totalQty) * 100 : 0}%` }}
          />
        </div>
        <div className="flex justify-between text-[12px] mb-4">
          <span className="text-[#888]">{event.totalSold}명 결제 완료</span>
          <span className="text-[#aaaaaa]">{event.totalQty - event.totalSold}석 남음</span>
        </div>

        {/* Recent buyers */}
        {event.recentPurchases.map((p) => (
          <div key={p.id} className="flex items-center justify-between py-2">
            <div>
              <p className="text-[14px] font-medium text-[#111]">{p.buyerName}</p>
              <p className="text-[11px] text-[#aaaaaa]">{p.ticketName}</p>
            </div>
            <span
              className={`inline-flex items-center h-[18px] px-3 rounded-[9px] text-[10px] font-medium ${
                p.checkedIn ? "bg-[#e6f9f4] text-[#00c49a]" : "bg-[#f5f5f6] text-[#cccccc]"
              }`}
            >
              {p.checkedIn ? "체크인" : "미확인"}
            </span>
          </div>
        ))}

        {/* View all link */}
        <Link
          href={`/host/events/${event.id}/checkin`}
          className="block w-full h-7 bg-[#f5f5f6] rounded-[10px] text-[13px] font-medium text-[#5a42f5] text-center leading-7 mt-2"
        >
          구매자 명단 전체 보기 →
        </Link>
      </div>

      {/* Checkin CTA */}
      <div className="bg-white border-t border-[#f0f0f0] px-5 pt-3 pb-5 mt-[10px]">
        <p className="text-center text-[12px] text-[#aaaaaa] mb-3">행사 당일 입장객을 확인해요</p>
        <Link
          href={`/host/events/${event.id}/checkin`}
          className="block w-full h-[52px] bg-[#5a42f5] rounded-[16px] text-[16px] font-semibold text-white text-center leading-[52px]"
        >
          체크인 시작하기
        </Link>
      </div>
    </div>
  );
}
