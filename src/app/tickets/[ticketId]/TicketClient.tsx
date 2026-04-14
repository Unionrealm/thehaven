"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Purchase } from "@/lib/types";

interface TicketClientProps {
  purchase: Purchase;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const months = d.getMonth() + 1;
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  return `${months}월 ${d.getDate()}일 ${days[d.getDay()]}`;
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  const h = d.getHours();
  const ampm = h >= 12 ? "오후" : "오전";
  const hh = h > 12 ? h - 12 : h;
  return `${ampm} ${hh}시`;
}

export default function TicketClient({ purchase: initialPurchase }: TicketClientProps) {
  const [checkedIn, setCheckedIn] = useState(initialPurchase.checkedIn);

  useEffect(() => {
    // Subscribe to realtime check-in updates
    const channel = supabase
      .channel(`ticket-${initialPurchase.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "Purchase",
          filter: `id=eq.${initialPurchase.id}`,
        },
        (payload) => {
          if (payload.new && "checkedIn" in payload.new) {
            setCheckedIn(payload.new.checkedIn as boolean);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [initialPurchase.id]);

  const event = initialPurchase.event!;
  const ticket = initialPurchase.ticket!;

  function handleKakaoShare() {
    if (typeof window !== "undefined" && (window as unknown as { Kakao?: { isInitialized?: () => boolean; Share?: { sendDefault: (opts: unknown) => void } } }).Kakao?.isInitialized?.()) {
      const Kakao = (window as unknown as { Kakao: { Share: { sendDefault: (opts: unknown) => void } } }).Kakao;
      Kakao.Share.sendDefault({
        objectType: "text",
        text: `[Haven] ${event.title} 티켓이 발행됐어요! #${initialPurchase.ticketNumber}`,
        link: { mobileWebUrl: window.location.href, webUrl: window.location.href },
      });
    }
  }

  return (
    <div className="px-5 py-6">
      {/* Ticket card */}
      <div className="relative">
        {/* Shadow */}
        <div className="absolute inset-x-0.5 top-1 bottom-0 bg-black/10 rounded-[20px]" />
        {/* Card */}
        <div className="relative bg-white rounded-[20px] overflow-hidden">
          {/* Top: poster area */}
          <div className="bg-[#ede9fc] h-[140px] relative px-4 pt-4">
            {/* Category badge */}
            <span className="inline-flex items-center px-3 py-1 bg-[#5a42f5] rounded-[22px] text-[11px] font-medium text-white">
              {event.category}
            </span>
            {/* Title */}
            <h2 className="text-[18px] font-semibold text-[#111] tracking-[-0.5px] mt-2 leading-[26px]">
              {event.title}
            </h2>
            {/* Date & Location pills */}
            <div className="flex gap-2 mt-2">
              <span className="inline-flex items-center h-7 px-3 bg-white/85 rounded-[14px] text-[11px] font-medium text-[#555]">
                {formatDate(event.date)} {formatTime(event.date)}
              </span>
              <span className="inline-flex items-center h-7 px-3 bg-white/85 rounded-[14px] text-[11px] font-medium text-[#555]">
                {event.location.split(" ").slice(-1)[0] || event.location}
              </span>
            </div>
          </div>

          {/* Ticket punch divider */}
          <div className="relative flex items-center">
            <div className="absolute -left-3 w-6 h-6 bg-[#f7f7f8] rounded-full" />
            <div className="absolute -right-3 w-6 h-6 bg-[#f7f7f8] rounded-full" />
            <div className="w-full border-t border-dashed border-[#cccccc] mx-4" />
          </div>

          {/* Bottom: ticket info */}
          <div className="px-4 py-4">
            <p className="text-[11px] text-[#aaaaaa] font-medium mb-1">티켓 번호</p>
            <div className="flex items-start justify-between">
              <p className="text-[26px] font-bold text-[#5a42f5] tracking-[-0.5px]">
                #{initialPurchase.ticketNumber}
              </p>
              {/* QR code placeholder */}
              <div className="w-[72px] h-[72px] bg-[#f7f7f8] rounded-[10px] grid grid-cols-3 gap-1 p-1.5">
                {[...Array(9)].map((_, i) => (
                  <div
                    key={i}
                    className={`rounded-[2px] ${
                      [0, 2, 6, 8, 4].includes(i) ? "bg-[#5a42f5]" : "bg-[#cccccc]/40"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="border-t border-[#f0f0f0] mt-3 pt-3 space-y-1.5">
              <div className="flex">
                <span className="w-20 text-[11px] text-[#aaaaaa]">이름</span>
                <span className="text-[12px] text-[#444]">{initialPurchase.buyerName}</span>
              </div>
              <div className="flex">
                <span className="w-20 text-[11px] text-[#aaaaaa]">티켓 종류</span>
                <span className="text-[12px] text-[#444]">{ticket.name}</span>
              </div>
              <div className="flex">
                <span className="w-20 text-[11px] text-[#aaaaaa]">결제 금액</span>
                <span className="text-[12px] text-[#444]">{initialPurchase.paidAmount.toLocaleString("ko-KR")}원</span>
              </div>
            </div>

            {/* Check-in status */}
            <div
              className={`mt-3 h-11 rounded-[12px] flex items-center justify-center gap-2 ${
                checkedIn ? "bg-[#e6f9f4]" : "bg-[#f7f7f8]"
              }`}
            >
              <span className={`text-[12px] ${checkedIn ? "text-[#00c49a]" : "text-[#888]"}`}>
                {checkedIn ? "✓ 체크인 완료" : "아직 체크인 전이에요"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Kakao share button */}
      <button
        onClick={handleKakaoShare}
        className="w-full h-12 bg-[#ffe000] rounded-[14px] flex items-center justify-center mt-6"
      >
        <span className="text-[15px] font-semibold text-[#1f1400]">카카오톡으로 공유하기</span>
      </button>

      {/* Home link */}
      <button
        onClick={() => (window.location.href = "/")}
        className="w-full text-center text-[14px] text-[#aaaaaa] mt-4"
      >
        홈으로 돌아가기
      </button>
    </div>
  );
}
