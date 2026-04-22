import { notFound } from "next/navigation";
import MobileContainer from "@/components/layout/MobileContainer";
import AppBar from "@/components/layout/AppBar";
import TicketClient from "./TicketClient";
import { supabase } from "@/lib/supabase";

interface PageProps {
  params: Promise<{ ticketId: string }>;
}

export default async function TicketPage({ params }: PageProps) {
  const { ticketId } = await params;

  const { data: purchase, error } = await supabase
    .from("Purchase")
    .select("*, Event(*), Ticket(*)")
    .eq("id", ticketId)
    .single();

  if (error || !purchase) return notFound();

  const row = purchase as Record<string, unknown>;
  const eventData = row.Event as Record<string, unknown>;
  const ticketData = row.Ticket as Record<string, unknown>;

  const serialized = {
    id: row.id as string,
    ticketNumber: row.ticketNumber as string,
    eventId: row.eventId as string,
    ticketId: row.ticketId as string,
    buyerName: row.buyerName as string,
    buyerPhone: row.buyerPhone as string,
    paidAmount: row.paidAmount as number,
    paymentId: row.paymentId as string,
    payMethod: row.payMethod as string,
    checkedIn: row.checkedIn as boolean,
    checkedInAt: row.checkedInAt as string | undefined,
    createdAt: row.createdAt as string,
    event: {
      id: eventData.id as string,
      slug: eventData.slug as string,
      title: eventData.title as string,
      category: eventData.category as string,
      date: eventData.date as string,
      location: eventData.location as string,
      description: eventData.description as string,
      tickets: [],
    },
    ticket: {
      id: ticketData.id as string,
      name: ticketData.name as string,
      price: ticketData.price as number,
      totalQty: ticketData.totalQty as number,
      soldQty: ticketData.soldQty as number,
    },
  };

  return (
    <MobileContainer>
      {/* Violet success banner */}
      <div className="bg-[#5a42f5] py-4 px-5">
        <div className="h-11" />
        <div className="flex items-center justify-between">
          <span className="font-bold text-[#5a42f5] text-[18px]" style={{ fontFamily: "'Palanquin', sans-serif" }}>
            {/* invisible — just for spacing */}
          </span>
        </div>
      </div>

      <AppBar showLogo />

      {/* Success banner */}
      <div className="bg-[#5a42f5] px-5 py-4 flex flex-col items-center">
        <p className="text-[16px] font-semibold text-white">결제가 완료됐어요 ✓</p>
        <p className="text-[13px] text-white/70 mt-0.5">티켓이 발행됐습니다</p>
      </div>

      <TicketClient purchase={serialized as Parameters<typeof TicketClient>[0]["purchase"]} />
    </MobileContainer>
  );
}
