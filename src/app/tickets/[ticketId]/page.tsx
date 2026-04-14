import { notFound } from "next/navigation";
import MobileContainer from "@/components/layout/MobileContainer";
import AppBar from "@/components/layout/AppBar";
import TicketClient from "./TicketClient";
import { prisma } from "@/lib/prisma";

interface PageProps {
  params: Promise<{ ticketId: string }>;
}

export default async function TicketPage({ params }: PageProps) {
  const { ticketId } = await params;

  let purchase;
  try {
    purchase = await prisma.purchase.findUnique({
      where: { id: ticketId },
      include: {
        event: true,
        ticket: true,
      },
    });
  } catch {
    return notFound();
  }

  if (!purchase) return notFound();

  const serialized = {
    id: purchase.id,
    ticketNumber: purchase.ticketNumber,
    eventId: purchase.eventId,
    ticketId: purchase.ticketId,
    buyerName: purchase.buyerName,
    buyerPhone: purchase.buyerPhone,
    paidAmount: purchase.paidAmount,
    paymentId: purchase.paymentId,
    payMethod: purchase.payMethod,
    checkedIn: purchase.checkedIn,
    checkedInAt: purchase.checkedInAt?.toISOString(),
    createdAt: purchase.createdAt.toISOString(),
    event: {
      id: purchase.event.id,
      slug: purchase.event.slug,
      title: purchase.event.title,
      category: purchase.event.category,
      date: purchase.event.date.toISOString(),
      location: purchase.event.location,
      description: purchase.event.description,
      tickets: [],
    },
    ticket: {
      id: purchase.ticket.id,
      name: purchase.ticket.name,
      price: purchase.ticket.price,
      totalQty: purchase.ticket.totalQty,
      soldQty: purchase.ticket.soldQty,
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
