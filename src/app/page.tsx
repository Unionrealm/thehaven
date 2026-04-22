import Link from "next/link";
import MobileContainer from "@/components/layout/MobileContainer";
import { supabase } from "@/lib/supabase";
import { MOCK_EVENTS } from "@/lib/mockEvents";
import HomeFeedClient from "./HomeFeedClient";
import type { Event } from "@/lib/types";

export const dynamic = "force-dynamic";

async function getDbEvents(): Promise<Event[]> {
  try {
    const { data: events, error } = await supabase
      .from("Event")
      .select("*, Ticket(*)")
      .order("createdAt", { ascending: false })
      .limit(20);

    if (error || !events) return [];

    return events.map((e: Record<string, unknown>) => ({
      id: e.id as string,
      slug: e.slug as string,
      title: e.title as string,
      category: e.category as string,
      date: e.date as string,
      endTime: (e.endTime as string) ?? undefined,
      location: e.location as string,
      detailedAddress: (e.detailedAddress as string) ?? undefined,
      description: e.description as string,
      seatInfo: (e.seatInfo as string) ?? undefined,
      posterUrl: (e.posterUrl as string) ?? undefined,
      organizer: { name: "주최자" },
      tickets: ((e.Ticket ?? []) as Record<string, unknown>[]).map((t) => ({
        id: t.id as string,
        name: t.name as string,
        price: t.price as number,
        totalQty: t.totalQty as number,
        soldQty: t.soldQty as number,
      })),
    }));
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const dbEvents = await getDbEvents();
  const events: Event[] = [...dbEvents, ...MOCK_EVENTS];

  return (
    <MobileContainer className="bg-white">
      {/* Top app bar */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm">
        <div className="h-[52px] px-5 flex items-center justify-between">
          <h1
            className="text-[22px] font-bold text-[#5a42f5] tracking-[-0.8px]"
            style={{ fontFamily: "'Palanquin', sans-serif" }}
          >
            haven
          </h1>
          <Link
            href="/host/events/new"
            className="inline-flex items-center gap-1 h-[34px] px-3.5 bg-[#5a42f5] rounded-[17px] text-[12px] font-semibold text-white"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 2v8M2 6h8" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            이벤트 만들기
          </Link>
        </div>
      </div>

      {/* Hero — compact */}
      <div className="px-5 pt-4 pb-5">
        <h2 className="text-[22px] font-bold text-[#111] tracking-[-0.6px] leading-[30px]">
          이번 주, 가까운 곳에서
          <br />
          어떤 이벤트가 열릴까요?
        </h2>
        <p className="text-[13px] text-[#888] mt-2 leading-[20px]">
          링크 하나로 티켓을 사고팔 수 있어요
        </p>
      </div>

      <HomeFeedClient events={events} />
    </MobileContainer>
  );
}
