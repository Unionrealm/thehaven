import { notFound } from "next/navigation";
import Link from "next/link";
import MobileContainer from "@/components/layout/MobileContainer";
import AppBar from "@/components/layout/AppBar";
import { supabase } from "@/lib/supabase";
import DashboardClient from "./DashboardClient";

interface PageProps {
  params: Promise<{ eventId: string }>;
}

export default async function HostDashboardPage({ params }: PageProps) {
  const { eventId } = await params;

  const { data: event } = await supabase
    .from("Event")
    .select("*, Ticket(*), Purchase(*, Ticket(*))")
    .eq("id", eventId)
    .single();

  if (!event) return notFound();

  const tickets = (event.Ticket ?? []) as Record<string, unknown>[];
  const purchases = (event.Purchase ?? []) as Record<string, unknown>[];

  const totalSold = tickets.reduce((sum: number, t) => sum + (t.soldQty as number), 0);
  const totalQty = tickets.reduce((sum: number, t) => sum + (t.totalQty as number), 0);
  const totalRevenue = purchases.reduce((sum: number, p) => sum + (p.paidAmount as number), 0);
  const checkedInCount = purchases.filter((p) => p.checkedIn === true).length;

  const serialized = {
    id: event.id as string,
    slug: event.slug as string,
    title: event.title as string,
    date: event.date as string,
    location: event.location as string,
    category: event.category as string,
    posterUrl: (event.posterUrl as string) ?? undefined,
    totalSold,
    totalQty,
    totalRevenue,
    checkedInCount,
    recentPurchases: purchases.slice(0, 3).map((p) => {
      const ticket = (p.Ticket ?? {}) as Record<string, unknown>;
      return {
        id: p.id as string,
        buyerName: p.buyerName as string,
        ticketName: ticket.name as string,
        checkedIn: p.checkedIn as boolean,
      };
    }),
  };

  return (
    <MobileContainer>
      <AppBar
        title={event.title as string}
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
