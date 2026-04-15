import Link from "next/link";
import MobileContainer from "@/components/layout/MobileContainer";
import { prisma } from "@/lib/prisma";
import { MOCK_EVENTS } from "@/lib/mockEvents";
import HomeFeedClient from "./HomeFeedClient";
import type { Event } from "@/lib/types";

export const dynamic = "force-dynamic";

async function getDbEvents(): Promise<Event[]> {
  try {
    const events = await prisma.event.findMany({
      include: { tickets: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    return events.map((e) => ({
      id: e.id,
      slug: e.slug,
      title: e.title,
      category: e.category,
      date: e.date.toISOString(),
      endTime: e.endTime ?? undefined,
      location: e.location,
      detailedAddress: e.detailedAddress ?? undefined,
      description: e.description,
      seatInfo: e.seatInfo ?? undefined,
      posterUrl: e.posterUrl ?? undefined,
      organizer: { name: "주최자" },
      tickets: e.tickets.map((t) => ({
        id: t.id,
        name: t.name,
        price: t.price,
        totalQty: t.totalQty,
        soldQty: t.soldQty,
      })),
    }));
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const dbEvents = await getDbEvents();
  // Mock events come first so the feed is never empty even before the DB
  // is wired up; user-created DB events appear above on subsequent loads.
  const events: Event[] = [...dbEvents, ...MOCK_EVENTS];

  return (
    <MobileContainer className="bg-[#f7f7f8]">
      {/* Top app bar — logo only, no gap above */}
      <div className="sticky top-0 z-10 bg-white border-b border-[#f0f0f0]">
        <div className="h-[52px] px-5 flex items-center">
          <h1
            className="text-[22px] font-bold text-[#5a42f5] tracking-[-0.8px]"
            style={{ fontFamily: "'Palanquin', sans-serif" }}
          >
            haven
          </h1>
        </div>
      </div>

      {/* Hero */}
      <div className="bg-white px-5 pt-5 pb-6 border-b border-[#f0f0f0]">
        <h2 className="text-[20px] font-semibold text-[#111] tracking-[-0.5px] leading-[28px]">
          이번 주, 가까운 곳에서
          <br />
          어떤 이벤트가 열릴까요?
        </h2>
        <p className="text-[13px] text-[#888] mt-2 leading-[20px]">
          링크 하나로 티켓을 사고팔 수 있어요. 회원가입은 필요 없어요.
        </p>
      </div>

      {/* Primary CTA — create event (the headline action) */}
      <div className="px-5 pt-6 pb-2">
        <Link
          href="/host/events/new"
          className="block relative overflow-hidden rounded-[20px] bg-gradient-to-br from-[#6a52ff] to-[#5a42f5] px-6 py-7 text-white shadow-[0_8px_24px_-8px_rgba(90,66,245,0.45)]"
        >
          {/* Decorative blobs */}
          <span
            aria-hidden
            className="absolute -top-8 -right-6 w-32 h-32 rounded-full bg-white/10 blur-2xl"
          />
          <span
            aria-hidden
            className="absolute -bottom-10 -left-4 w-28 h-28 rounded-full bg-white/10 blur-2xl"
          />

          <div className="relative flex items-center justify-between">
            <div>
              <span className="inline-flex items-center h-[22px] px-2.5 bg-white/20 rounded-[11px] text-[11px] font-semibold tracking-[-0.2px]">
                주최자라면
              </span>
              <p className="mt-3 text-[20px] font-bold leading-[28px] tracking-[-0.5px]">
                이벤트를
                <br />
                직접 열어보세요
              </p>
              <p className="mt-2 text-[13px] text-white/80 leading-[20px]">
                링크 하나로 티켓 판매 시작
              </p>
            </div>
            <div className="w-12 h-12 bg-white/15 rounded-full flex items-center justify-center shrink-0 ml-3">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path
                  d="M11 4v14M4 11h14"
                  stroke="white"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          <div className="relative mt-5 inline-flex items-center gap-1.5 h-[38px] px-4 bg-white text-[#5a42f5] rounded-[19px] text-[13px] font-semibold">
            지금 만들기
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M5 3l4 4-4 4"
                stroke="#5a42f5"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </Link>
      </div>

      <HomeFeedClient events={events} />
    </MobileContainer>
  );
}
