import { Ticket } from "@/lib/types";

interface TicketCardProps {
  ticket: Ticket;
  selected: boolean;
  onSelect: (ticket: Ticket) => void;
}

function formatPrice(price: number) {
  return price.toLocaleString("ko-KR") + "원";
}

function getRemaining(ticket: Ticket) {
  return ticket.totalQty - ticket.soldQty;
}

export default function TicketCard({ ticket, selected, onSelect }: TicketCardProps) {
  const remaining = getRemaining(ticket);
  const isSoldOut = remaining <= 0;
  const isAlmostSoldOut = remaining > 0 && remaining <= 5;

  return (
    <button
      onClick={() => !isSoldOut && onSelect(ticket)}
      disabled={isSoldOut}
      className={`w-full flex items-center justify-between px-3 py-4 rounded-[14px] border text-left transition-colors ${
        selected
          ? "bg-[#f4f1ff] border-[#5a42f5] border-[1.5px]"
          : isSoldOut
          ? "bg-[#f7f7f8] border-[#e8e8e8] opacity-50"
          : "bg-white border-[#e8e8e8]"
      }`}
    >
      <div className="flex flex-col gap-0.5">
        <span className="text-[15px] font-medium text-[#111]">{ticket.name}</span>
        {isSoldOut ? (
          <span className="text-[13px] font-medium text-[#aaaaaa]">매진</span>
        ) : (
          <span
            className={`text-[13px] font-medium ${
              isAlmostSoldOut ? "text-[#f5a800]" : "text-[#00c49a]"
            }`}
          >
            잔여 {remaining}석
          </span>
        )}
      </div>
      <span className="text-[17px] font-semibold text-[#111] tracking-[-0.3px]">
        {formatPrice(ticket.price)}
      </span>
    </button>
  );
}
