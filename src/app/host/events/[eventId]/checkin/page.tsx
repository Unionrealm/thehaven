import { notFound } from "next/navigation";
import MobileContainer from "@/components/layout/MobileContainer";
import AppBar from "@/components/layout/AppBar";
import CheckinClient from "./CheckinClient";
import { supabase } from "@/lib/supabase";

interface PageProps {
  params: Promise<{ eventId: string }>;
}

export default async function CheckinPage({ params }: PageProps) {
  const { eventId } = await params;

  const { data: event, error } = await supabase
    .from("Event")
    .select("*, Ticket(*), Purchase(*, Ticket(*))")
    .eq("id", eventId)
    .single();

  if (error || !event) return notFound();

  const row = event as Record<string, unknown>;
  const tickets = (row.Ticket ?? []) as Record<string, unknown>[];
  const purchases = ((row.Purchase ?? []) as Record<string, unknown>[])
    .slice()
    .sort((a, b) =>
      String(b.createdAt ?? "").localeCompare(String(a.createdAt ?? ""))
    );

  const totalQty = tickets.reduce(
    (sum, t) => sum + ((t.totalQty as number) || 0),
    0
  );
  const paidCount = purchases.length;

  const buyers = purchases.map((p) => {
    const ticket = (p.Ticket ?? {}) as Record<string, unknown>;
    return {
      id: p.id as string,
      ticketNumber: (p.ticketNumber as string) ?? "",
      buyerName: (p.buyerName as string) ?? "",
      ticketName: (ticket.name as string) ?? "티켓",
      createdAt: (p.createdAt as string) ?? "",
      checkedIn: (p.checkedIn as boolean) ?? false,
    };
  });

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
