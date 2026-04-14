import { notFound } from "next/navigation";
import MobileContainer from "@/components/layout/MobileContainer";
import AppBar from "@/components/layout/AppBar";
import CheckinClient from "./CheckinClient";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

interface PageProps {
  params: Promise<{ eventId: string }>;
}

type TicketRow = Prisma.TicketGetPayload<Record<string, never>>;
type PurchaseWithTicket = Prisma.PurchaseGetPayload<{ include: { ticket: true } }>;

export default async function CheckinPage({ params }: PageProps) {
  const { eventId } = await params;

  const event = await prisma.event
    .findUnique({
      where: { id: eventId },
      include: {
        tickets: true,
        purchases: {
          include: { ticket: true },
          orderBy: { createdAt: "desc" },
        },
      },
    })
    .catch(() => null);

  if (!event) return notFound();

  const totalQty = (event.tickets as TicketRow[]).reduce(
    (sum: number, t: TicketRow) => sum + t.totalQty,
    0
  );
  const paidCount = event.purchases.length;

  const buyers = (event.purchases as PurchaseWithTicket[]).map((p: PurchaseWithTicket) => ({
    id: p.id,
    ticketNumber: p.ticketNumber,
    buyerName: p.buyerName,
    ticketName: p.ticket.name,
    createdAt: p.createdAt.toISOString(),
    checkedIn: p.checkedIn,
  }));

  return (
    <MobileContainer>
      <AppBar
        title="구매자 명단"
        showBack
        rightAction={
          <span className="inline-flex items-center h-[22px] px-2 bg-[#f0edff] rounded-[11px] text-[11px] font-medium text-[#5a42f5]">
            {paidCount}/{totalQty}
          </span>
        }
      />
      <CheckinClient
        eventId={eventId}
        initialBuyers={buyers}
        totalQty={totalQty}
      />
    </MobileContainer>
  );
}
