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
      {/* Top app bar */}
      <div className="sticky top-0 z-10 bg-white border-b border-[#f0f0f0]">
        <div className="h-11" />
        <div className="h-[52px] px-5 flex items-center justify-between">
          <h1
            className="text-[22px] font-bold text-[#5a42f5] tracking-[-0.8px]"
            style={{ fontFamily: "'Palanquin', sans-serif" }}
          >
            haven
          </h1>
          <Link
            href="/host/events/new"
            className="inline-flex items-center h-[34px] px-3.5 bg-[#5a42f5] rounded-[17px] text-[12px] font-semibold text-white"
          >
            + 이벤트 만들기
          </Link>
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

      <HomeFeedClient events={events} />
    </MobileContainer>
  );
}
