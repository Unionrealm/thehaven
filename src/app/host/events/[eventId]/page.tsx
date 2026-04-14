import { notFound } from "next/navigation";
import Link from "next/link";
import MobileContainer from "@/components/layout/MobileContainer";
import AppBar from "@/components/layout/AppBar";
import { prisma } from "@/lib/prisma";
import DashboardClient from "./DashboardClient";
import type { Prisma } from "@prisma/client";

interface PageProps {
  params: Promise<{ eventId: string }>;
}

type TicketRow = Prisma.TicketGetPayload<Record<string, never>>;
type PurchaseWithTicket = Prisma.PurchaseGetPayload<{ include: { ticket: true } }>;

export default async function HostDashboardPage({ params }: PageProps) {
  const { eventId } = await params;

  const event = await prisma.event
    .findUnique({
      where: { id: eventId },
      include: {
        tickets: true,
        purchases: {
          orderBy: { createdAt: "desc" },
          take: 3,
          include: { ticket: true },
        },
      },
    })
    .catch(() => null);

  if (!event) return notFound();

  const tickets = event.tickets as TicketRow[];
  const purchases = event.purchases as PurchaseWithTicket[];

  const totalSold = tickets.reduce((sum: number, t: TicketRow) => sum + t.soldQty, 0);
  const totalQty = tickets.reduce((sum: number, t: TicketRow) => sum + t.totalQty, 0);
  const totalRevenue = purchases.reduce((sum: number, p: PurchaseWithTicket) => sum + p.paidAmount, 0);
  const checkedInCount = purchases.filter((p: PurchaseWithTicket) => p.checkedIn).length;

  const serialized = {
    id: event.id,
    slug: event.slug,
    title: event.title,
    date: event.date.toISOString(),
    location: event.location,
    category: event.category,
    posterUrl: event.posterUrl ?? undefined,
    totalSold,
    totalQty,
    totalRevenue,
    checkedInCount,
    recentPurchases: purchases.map((p: PurchaseWithTicket) => ({
      id: p.id,
      buyerName: p.buyerName,
      ticketName: p.ticket.name,
      checkedIn: p.checkedIn,
    })),
  };

  return (
    <MobileContainer>
      <AppBar
        title={event.title}
        showBack
        rightAction={
          <Link href={`/host/events/${eventId}/edit`} className="text-[14px] font-medium text-[#5a42f5]">
            편집
          </Link>
        }
      />
      <DashboardClient event={serialized} />
    </MobileContainer>
  );
}
