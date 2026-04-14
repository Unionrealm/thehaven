import { notFound } from "next/navigation";
import Link from "next/link";
import MobileContainer from "@/components/layout/MobileContainer";
import AppBar from "@/components/layout/AppBar";
import { prisma } from "@/lib/prisma";
import DashboardClient from "./DashboardClient";

interface PageProps {
  params: Promise<{ eventId: string }>;
}

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

  const totalSold = event.tickets.reduce((sum, t) => sum + t.soldQty, 0);
  const totalQty = event.tickets.reduce((sum, t) => sum + t.totalQty, 0);
  const totalRevenue = event.purchases.reduce((sum, p) => sum + p.paidAmount, 0);
  const checkedInCount = event.purchases.filter((p) => p.checkedIn).length;

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
    recentPurchases: event.purchases.map((p) => ({
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
