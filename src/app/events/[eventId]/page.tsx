import { notFound } from "next/navigation";
import MobileContainer from "@/components/layout/MobileContainer";
import AppBar from "@/components/layout/AppBar";
import EventDetailClient from "./EventDetailClient";
import { supabase } from "@/lib/supabase";
import { getMockEvent, isMockEventId } from "@/lib/mockEvents";
import type { Event } from "@/lib/types";

interface PageProps {
  params: Promise<{ eventId: string }>;
}

export default async function EventDetailPage({ params }: PageProps) {
  const { eventId } = await params;

  if (isMockEventId(eventId)) {
    const mock = getMockEvent(eventId);
    if (!mock) return notFound();
    return renderEvent(mock);
  }

  const { data: event } = await supabase
    .from("Event")
    .select("*, Ticket(*), Question(*)")
    .eq("id", eventId)
    .single();

  if (!event) return notFound();

  const serializedEvent: Event = {
    id: event.id as string,
    slug: event.slug as string,
    title: event.title as string,
    category: event.category as string,
    date: event.date as string,
    endTime: (event.endTime as string) ?? undefined,
    location: event.location as string,
    detailedAddress: (event.detailedAddress as string) ?? undefined,
    description: event.description as string,
    seatInfo: (event.seatInfo as string) ?? undefined,
    posterUrl: (event.posterUrl as string) ?? undefined,
    organizer: { name: "주최자" },
    tickets: ((event.Ticket ?? []) as Record<string, unknown>[]).map((t) => ({
      id: t.id as string,
      name: t.name as string,
      price: t.price as number,
      totalQty: t.totalQty as number,
      soldQty: t.soldQty as number,
    })),
    extraQuestions: ((event.Question ?? []) as Record<string, unknown>[]).map(
      (q) => ({
        id: q.id as string,
        label: q.label as string,
        options: Array.isArray(q.options)
          ? (q.options as string[])
          : undefined,
      })
    ),
  };

  return renderEvent(serializedEvent);
}

function renderEvent(event: Event) {
  return (
    <MobileContainer>
      <AppBar
        showBack
        rightAction={
          <button className="flex gap-1" aria-label="옵션">
            {[0, 1, 2].map((i) => (
              <span key={i} className="w-1 h-1 rounded-full bg-[#111]" />
            ))}
          </button>
        }
      />
      <EventDetailClient event={event} />
    </MobileContainer>
  );
}
