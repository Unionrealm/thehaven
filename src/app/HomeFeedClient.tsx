"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Event } from "@/lib/types";

const CATEGORIES = ["전체", "인디음악", "공연/뮤지컬", "원데이클래스", "언어교환", "기타"];

function formatDateChip(dateStr: string) {
  const d = new Date(dateStr);
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  const today = new Date();
  const diffDays = Math.round(
    (d.setHours(0, 0, 0, 0) - new Date(today).setHours(0, 0, 0, 0)) /
      (1000 * 60 * 60 * 24)
  );
  if (diffDays === 0) return "오늘";
  if (diffDays === 1) return "내일";
  if (diffDays > 1 && diffDays <= 7) return `D-${diffDays}`;
  const dd = new Date(dateStr);
  return `${dd.getMonth() + 1}/${dd.getDate()} ${days[dd.getDay()]}`;
}

function formatTimeRange(dateStr: string, endTime?: string) {
  const d = new Date(dateStr);
  const h = d.getHours();
  const ampm = h >= 12 ? "오후" : "오전";
  const hh = h > 12 ? h - 12 : h || 12;
  const m = d.getMinutes();
  const start = `${ampm} ${hh}:${m.toString().padStart(2, "0")}`;
  return endTime ? `${start} ~ ${endTime}` : start;
}

function priceRange(tickets: Event["tickets"]) {
  if (!tickets || tickets.length === 0) return null;
  const prices = tickets.map((t) => t.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  if (min === max) return `${min.toLocaleString("ko-KR")}원`;
  return `${min.toLocaleString("ko-KR")}원~`;
}

function remainingLabel(tickets: Event["tickets"]) {
  if (!tickets || tickets.length === 0) return null;
  const totalRemaining = tickets.reduce(
    (sum, t) => sum + (t.totalQty - t.soldQty),
    0
  );
  if (totalRemaining <= 0) return { label: "매진", tone: "soldout" as const };
  if (totalRemaining <= 5) return { label: `잔여 ${totalRemaining}석`, tone: "warm" as const };
  return { label: `잔여 ${totalRemaining}석`, tone: "cool" as const };
}

function categoryGradient(category: string): string {
  // Soft tinted gradients per category, used as poster fallback
  switch (category) {
    case "인디음악":
      return "linear-gradient(135deg, #ede9fc 0%, #c8c0fc 100%)";
    case "공연/뮤지컬":
      return "linear-gradient(135deg, #ffe4ec 0%, #ffb6c5 100%)";
    case "원데이클래스":
      return "linear-gradient(135deg, #fff4d6 0%, #ffd58a 100%)";
    case "언어교환":
      return "linear-gradient(135deg, #d6f5ed 0%, #87e0c5 100%)";
    default:
      return "linear-gradient(135deg, #f0f0f0 0%, #cccccc 100%)";
  }
}

export default function HomeFeedClient({ events }: { events: Event[] }) {
  const [filter, setFilter] = useState("전체");

  const filtered = useMemo(() => {
    if (filter === "전체") return events;
    return events.filter((e) => e.category === filter);
  }, [events, filter]);

  return (
    <div>
      {/* Category filter pills */}
      <div className="bg-white border-b border-[#f0f0f0] px-5 py-3 overflow-x-auto">
        <div className="flex gap-2 w-max">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`h-8 px-4 rounded-[20px] text-[13px] whitespace-nowrap transition-colors ${
                filter === cat
                  ? "bg-[#111] text-white font-medium"
                  : "bg-[#f5f5f6] text-[#555]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Feed */}
      <div className="px-5 py-5 flex flex-col gap-4">
        {filtered.length === 0 && (
          <div className="bg-white rounded-[16px] py-16 text-center">
            <p className="text-[14px] text-[#aaaaaa]">
              아직 {filter} 이벤트가 없어요
            </p>
          </div>
        )}

        {filtered.map((event) => {
          const remaining = remainingLabel(event.tickets);
          const price = priceRange(event.tickets);
          return (
            <Link
              key={event.id}
              href={`/events/${event.id}`}
              className="block bg-white rounded-[16px] overflow-hidden border border-[#f0f0f0]"
            >
              {/* Poster */}
              <div
                className="w-full h-[160px] flex items-end p-4"
                style={
                  event.posterUrl
                    ? {
                        backgroundImage: `url(${event.posterUrl})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }
                    : { background: categoryGradient(event.category) }
                }
              >
                <span className="inline-flex items-center h-[24px] px-2.5 bg-white/95 rounded-[12px] text-[11px] font-medium text-[#5a42f5]">
                  {event.category}
                </span>
              </div>

              {/* Info */}
              <div className="px-4 py-4">
                <h3 className="text-[16px] font-semibold text-[#111] tracking-[-0.4px] leading-[22px] line-clamp-2">
                  {event.title}
                </h3>
                <div className="flex items-center gap-2 mt-2 text-[12px] text-[#888]">
                  <span className="inline-flex items-center h-[20px] px-2 bg-[#f0edff] rounded-[10px] text-[11px] font-medium text-[#5a42f5]">
                    {formatDateChip(event.date)}
                  </span>
                  <span>{formatTimeRange(event.date, event.endTime)}</span>
                </div>
                <p className="text-[12px] text-[#888] mt-1.5">
                  {event.location}
                </p>

                <div className="flex items-end justify-between mt-3 pt-3 border-t border-[#f5f5f6]">
                  {price && (
                    <span className="text-[15px] font-semibold text-[#111]">
                      {price}
                    </span>
                  )}
                  {remaining && (
                    <span
                      className={`text-[12px] font-medium ${
                        remaining.tone === "soldout"
                          ? "text-[#aaaaaa]"
                          : remaining.tone === "warm"
                          ? "text-[#f5a800]"
                          : "text-[#00c49a]"
                      }`}
                    >
                      {remaining.label}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="h-8" />
    </div>
  );
}
