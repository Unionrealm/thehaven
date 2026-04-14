"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import TicketCard from "@/components/ui/TicketCard";
import PurchaseSheet from "./PurchaseSheet";
import { Event, Ticket } from "@/lib/types";

interface EventDetailClientProps {
  event: Event;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 ${days[d.getDay()]}요일`;
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  const h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? "오후" : "오전";
  const hh = h > 12 ? h - 12 : h;
  return `${ampm} ${hh}:${m.toString().padStart(2, "0")} 시작`;
}

function formatPrice(price: number) {
  return price.toLocaleString("ko-KR");
}

export default function EventDetailClient({ event }: EventDetailClientProps) {
  const router = useRouter();
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(
    event.tickets.find((t) => t.soldQty < t.totalQty) || null
  );
  const [sheetOpen, setSheetOpen] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  const remaining = selectedTicket
    ? selectedTicket.totalQty - selectedTicket.soldQty
    : 0;

  async function handlePay(name: string, phone: string, payMethod: string) {
    if (!selectedTicket) return;
    setLoading(true);

    try {
      // Create purchase record first
      const res = await fetch("/api/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: event.id,
          ticketId: selectedTicket.id,
          buyerName: name,
          buyerPhone: phone,
          payMethod,
          amount: selectedTicket.price,
        }),
      });
      const { purchaseId, paymentId } = await res.json();

      // Store session info for payment processing page
      sessionStorage.setItem("haven_purchase_id", purchaseId);
      sessionStorage.setItem("haven_payment_id", paymentId);
      sessionStorage.setItem(
        "haven_payment_info",
        JSON.stringify({
          eventTitle: event.title,
          ticketName: selectedTicket.name,
          amount: selectedTicket.price,
        })
      );

      // Navigate to processing page
      router.push("/payment/processing");
    } catch {
      setLoading(false);
      alert("결제 준비 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  }

  return (
    <>
      {/* Poster area */}
      <div
        className="w-full h-[280px] bg-[#d6d0fc] flex items-center justify-center"
        style={
          event.posterUrl
            ? { backgroundImage: `url(${event.posterUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
            : {}
        }
      >
        {!event.posterUrl && (
          <p className="text-[13px] font-medium text-[#aaaaaa]">포스터 이미지</p>
        )}
      </div>

      {/* Event info card */}
      <div className="bg-white px-5 py-6">
        {/* Category badge */}
        <span className="inline-flex items-center px-3 py-1 bg-[#ece8ff] rounded-[12px] text-[12px] font-medium text-[#5a42f5] mb-3">
          {event.category}
        </span>

        {/* Title */}
        <h1 className="text-[22px] font-semibold text-[#111] tracking-[-0.8px] leading-[28px] mb-4">
          {event.title}
        </h1>

        {/* Date */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-[38px] h-[38px] bg-[#f7f7f8] border border-[#ebebeb] rounded-[10px] flex items-center justify-center shrink-0">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="2" width="14" height="12" rx="2" stroke="#888" strokeWidth="1.5" />
              <path d="M1 6h14" stroke="#888" strokeWidth="1.5" />
              <rect x="4" y="0" width="2" height="4" rx="1" fill="#888" />
              <rect x="10" y="0" width="2" height="4" rx="1" fill="#888" />
            </svg>
          </div>
          <div>
            <p className="text-[14px] font-medium text-[#111]">{formatDate(event.date)}</p>
            <p className="text-[13px] text-[#888]">{formatTime(event.date)}{event.endTime ? ` · ${event.endTime}까지` : ""}</p>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-[38px] h-[38px] bg-[#f7f7f8] border border-[#ebebeb] rounded-[10px] flex items-center justify-center shrink-0">
            <svg width="14" height="18" viewBox="0 0 14 18" fill="none">
              <path d="M7 1C4.24 1 2 3.24 2 6c0 4.5 5 11 5 11s5-6.5 5-11c0-2.76-2.24-5-5-5z" stroke="#888" strokeWidth="1.5" />
              <circle cx="7" cy="6" r="2" stroke="#888" strokeWidth="1.5" />
            </svg>
          </div>
          <div>
            <p className="text-[14px] font-medium text-[#111]">{event.location}</p>
            <p className="text-[13px] text-[#888]">상세 주소는 결제 후 공개</p>
          </div>
        </div>

        {/* Organizer */}
        {event.organizer && (
          <div className="bg-[#f9f9fd] rounded-[14px] px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-[38px] h-[38px] rounded-full bg-[#5a42f5] flex items-center justify-center text-white font-bold text-[15px]">
                {event.organizer.name.charAt(0)}
              </div>
              <div>
                <p className="text-[12px] text-[#aaaaaa]">주최자</p>
                <p className="text-[14px] font-medium text-[#111]">{event.organizer.name}</p>
              </div>
            </div>
            <button className="text-[13px] font-medium text-[#5a42f5]">문의</button>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="h-[10px] bg-[#f2f2f3]" />

      {/* Description */}
      <div className="bg-white px-5 py-6">
        <h2 className="text-[18px] font-semibold text-[#111] mb-3">이벤트 소개</h2>
        <p
          className={`text-[14px] text-[#444] leading-[22px] ${
            !descExpanded ? "line-clamp-2" : ""
          }`}
        >
          {event.description}
        </p>
        {!descExpanded && (
          <button
            onClick={() => setDescExpanded(true)}
            className="text-[13px] font-medium text-[#5a42f5] mt-1"
          >
            더보기
          </button>
        )}
      </div>

      {/* Seat info */}
      {event.seatInfo && (
        <>
          <div className="h-[10px] bg-[#f2f2f3]" />
          <div className="bg-white px-5 py-6">
            <h2 className="text-[18px] font-semibold text-[#111] mb-3">자리 안내</h2>
            <div className="bg-[#f5f5f6] rounded-[14px] px-4 py-3">
              <p className="text-[13px] text-[#555] leading-[20px]">{event.seatInfo}</p>
            </div>
          </div>
        </>
      )}

      {/* Divider */}
      <div className="h-[10px] bg-[#f2f2f3]" />

      {/* Tickets */}
      <div className="bg-white px-5 py-6">
        <h2 className="text-[18px] font-semibold text-[#111] mb-4">티켓</h2>
        <div className="flex flex-col gap-2">
          {event.tickets.map((ticket) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              selected={selectedTicket?.id === ticket.id}
              onSelect={setSelectedTicket}
            />
          ))}
        </div>
      </div>

      {/* Extra questions */}
      {event.extraQuestions && event.extraQuestions.length > 0 && (
        <>
          <div className="h-[10px] bg-[#f2f2f3]" />
          <div className="bg-white px-5 py-6">
            <h2 className="text-[18px] font-semibold text-[#111] mb-4">추가 정보</h2>
            {event.extraQuestions.map((q) => (
              <div key={q.id} className="mb-4">
                <p className="text-[13px] text-[#3a3a3a] mb-2">{q.label}</p>
                {q.options && (
                  <div className="flex flex-wrap gap-2">
                    {q.options.map((opt) => (
                      <button
                        key={opt}
                        className="h-[22px] px-3 bg-white border border-[#ebebeb] rounded-[20px] text-[12px] text-[#555]"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Spacer for sticky CTA */}
      <div className="h-24" />

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[375px] bg-white border-t border-[#f0f0f0] px-5 py-4">
        {selectedTicket && (
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-[13px] text-[#888]">{selectedTicket.name}</span>
              <span className="text-[20px] font-semibold text-[#111] tracking-[-0.5px]">
                {formatPrice(selectedTicket.price)}원
              </span>
            </div>
            <span className="text-[12px] font-medium text-[#00c49a]">잔여 {remaining}석</span>
          </div>
        )}
        <button
          onClick={() => setSheetOpen(true)}
          disabled={!selectedTicket || loading}
          className="w-full h-[48px] bg-[#5a42f5] rounded-[16px] text-[16px] font-semibold text-white tracking-[-0.3px] disabled:opacity-50"
        >
          {loading ? "처리 중..." : "티켓 구매하기"}
        </button>
      </div>

      {/* Purchase bottom sheet */}
      {selectedTicket && (
        <PurchaseSheet
          open={sheetOpen}
          onClose={() => setSheetOpen(false)}
          ticket={selectedTicket}
          eventTitle={event.title}
          onPay={handlePay}
        />
      )}
    </>
  );
}
