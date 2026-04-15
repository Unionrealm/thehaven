import { notFound } from "next/navigation";
import MobileContainer from "@/components/layout/MobileContainer";
import AppBar from "@/components/layout/AppBar";
import EventDetailClient from "./EventDetailClient";
import { prisma } from "@/lib/prisma";
import { getMockEvent, isMockEventId } from "@/lib/mockEvents";
import type { Prisma } from "@prisma/client";
import type { Event } from "@/lib/types";

interface PageProps {
  params: Promise<{ eventId: string }>;
}

type QuestionRow = Prisma.QuestionGetPayload<Record<string, never>>;

export default async function EventDetailPage({ params }: PageProps) {
  const { eventId } = await params;

  // Mock events bypass the DB entirely so the home feed's example cards
  // always render even without DATABASE_URL configured.
  if (isMockEventId(eventId)) {
    const mock = getMockEvent(eventId);
    if (!mock) return notFound();
    return renderEvent(mock);
  }

  const event = await prisma.event
    .findUnique({
      where: { id: eventId },
      include: {
        tickets: true,
        extraQuestions: true,
      },
    })
    .catch(() => null);

  if (!event) return notFound();

  const serializedEvent: Event = {
    id: event.id,
    slug: event.slug,
    title: event.title,
    category: event.category,
    date: event.date.toISOString(),
    endTime: event.endTime ?? undefined,
    location: event.location,
    detailedAddress: event.detailedAddress ?? undefined,
    description: event.description,
    seatInfo: event.seatInfo ?? undefined,
    posterUrl: event.posterUrl ?? undefined,
    organizer: { name: "주최자" },
    tickets: event.tickets,
    extraQuestions: (event.extraQuestions as QuestionRow[]).map((q: QuestionRow) => ({
      id: q.id,
      label: q.label,
      options: Array.isArray(q.options) ? (q.options as string[]) : undefined,
    })),
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
