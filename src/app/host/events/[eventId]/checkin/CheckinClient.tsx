"use client";

import { useState, useTransition } from "react";
import { supabase } from "@/lib/supabase";

interface BuyerRow {
  id: string;
  ticketNumber: string;
  buyerName: string;
  ticketName: string;
  createdAt: string;
  checkedIn: boolean;
}

type FilterType = "all" | "paid" | "checkin" | "pending";

function formatPurchaseTime(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();

  const h = d.getHours();
  const ampm = h >= 12 ? "PM" : "AM";
  const hh = h > 12 ? h - 12 : h || 12;
  const mm = d.getMinutes().toString().padStart(2, "0");

  if (isToday) return `오늘 ${hh}:${mm} ${ampm}`;
  if (isYesterday) return `어제 ${hh}:${mm} ${ampm}`;
  return `${d.getMonth() + 1}/${d.getDate()} ${hh}:${mm} ${ampm}`;
}

export default function CheckinClient({
  eventId,
  initialBuyers,
  totalQty,
}: {
  eventId: string;
  initialBuyers: BuyerRow[];
  totalQty: number;
}) {
  const [buyers, setBuyers] = useState<BuyerRow[]>(initialBuyers);
  const [filter, setFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");
  const [, startTransition] = useTransition();

  const paidCount = buyers.length;
  const checkinCount = buyers.filter((b) => b.checkedIn).length;
  const pendingCount = paidCount - checkinCount;

  const filtered = buyers.filter((b) => {
    if (search && !b.buyerName.includes(search)) return false;
    if (filter === "checkin") return b.checkedIn;
    if (filter === "pending") return !b.checkedIn;
    if (filter === "paid") return true;
    return true;
  });

  async function handleCheckin(purchaseId: string) {
    // Optimistic update
    setBuyers((prev) =>
      prev.map((b) => (b.id === purchaseId ? { ...b, checkedIn: true } : b))
    );

    startTransition(async () => {
      try {
        await fetch(`/api/checkin/${purchaseId}`, { method: "PATCH" });
        // Broadcast via Supabase Realtime
        await supabase.channel("checkin-broadcast").send({
          type: "broadcast",
          event: "checkin",
          payload: { purchaseId },
        });
      } catch {
        // Revert on error
        setBuyers((prev) =>
          prev.map((b) => (b.id === purchaseId ? { ...b, checkedIn: false } : b))
        );
      }
    });
  }

  const FILTERS: { id: FilterType; label: string; count?: number }[] = [
    { id: "all", label: "전체" },
    { id: "paid", label: "결제완료" },
    { id: "checkin", label: "체크인" },
    { id: "pending", label: "미확인" },
  ];

  return (
    <div>
      {/* Stats row */}
      <div className="bg-white px-5 py-3 flex border-b border-[#e8e8e8]">
        {[
          { label: "전체", value: totalQty, color: "text-[#111]" },
          { label: "결제완료", value: paidCount, color: "text-[#5a42f5]" },
          { label: "체크인", value: checkinCount, color: "text-[#00c49a]" },
          { label: "미확인", value: pendingCount, color: "text-[#aaaaaa]" },
        ].map(({ label, value, color }) => (
          <div key={label} className="flex-1 text-center">
            <p className="text-[10px] text-[#aaaaaa] mb-0.5">{label}</p>
            <p className={`text-[14px] font-semibold ${color}`}>{value}명</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white px-4 py-3 border-b border-[#e8e8e8]">
        <div className="h-9 bg-[#f5f5f6] rounded-[12px] flex items-center px-4 gap-2">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="6" cy="6" r="5" stroke="#ccc" strokeWidth="1.5" />
            <path d="M10 10l3 3" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="이름으로 검색"
            className="flex-1 bg-transparent text-[13px] placeholder:text-[#cccccc] focus:outline-none"
          />
        </div>
      </div>

      {/* Filter tabs */}
      <div className="bg-white px-4 py-3 flex gap-2 border-b border-[#e8e8e8]">
        {FILTERS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setFilter(id)}
            className={`h-[26px] px-3 rounded-[13px] text-[12px] transition-colors ${
              filter === id
                ? "bg-[#111] text-white font-medium"
                : "bg-[#f5f5f6] text-[#555]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="h-[10px] bg-[#f7f7f8]" />

      {/* Buyer list */}
      <div>
        {filtered.map((buyer) => (
          <div key={buyer.id}>
            <div className="bg-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Ticket number badge */}
                <div className="h-[22px] px-2 bg-[#f5f5f6] rounded-[6px] flex items-center">
                  <span className="text-[10px] font-medium text-[#aaaaaa]">#{buyer.ticketNumber.replace("HAVEN-", "")}</span>
                </div>
                <div>
                  <p className="text-[15px] font-semibold text-[#111]">{buyer.buyerName}</p>
                  <p className="text-[11px] text-[#aaaaaa]">
                    {buyer.ticketName} · {formatPurchaseTime(buyer.createdAt)}
                  </p>
                </div>
              </div>

              {buyer.checkedIn ? (
                <span className="inline-flex items-center h-[26px] px-3 bg-[#e6f9f4] rounded-[13px] text-[10px] font-medium text-[#00c49a]">
                  ✓ 체크인 완료
                </span>
              ) : (
                <button
                  onClick={() => handleCheckin(buyer.id)}
                  className="h-[26px] px-3 bg-[#f5f5f6] border border-[#e8e8e8] rounded-[13px] text-[10px] font-medium text-[#aaaaaa]"
                >
                  체크인 하기
                </button>
              )}
            </div>
            <div className="h-px bg-[#f0f0f0]" />
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="bg-white py-16 text-center">
            <p className="text-[14px] text-[#aaaaaa]">해당하는 구매자가 없어요</p>
          </div>
        )}
      </div>
    </div>
  );
}
