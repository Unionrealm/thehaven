import { notFound } from "next/navigation";
import MobileContainer from "@/components/layout/MobileContainer";
import AppBar from "@/components/layout/AppBar";
import EventDetailClient from "./EventDetailClient";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

interface PageProps {
  params: Promise<{ eventId: string }>;
}

type QuestionRow = Prisma.QuestionGetPayload<Record<string, never>>;

export default async function EventDetailPage({ params }: PageProps) {
  const { eventId } = await params;

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

  const serializedEvent = {
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

  return (
    <MobileContainer>
      <AppBar showLogo rightAction={
        <button className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <span key={i} className="w-1 h-1 rounded-full bg-[#111]" />
          ))}
        </button>
      } />
      <EventDetailClient event={serializedEvent} />
    </MobileContainer>
  );
}
