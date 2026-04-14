export interface Event {
  id: string;
  slug: string;
  title: string;
  category: string;
  date: string;
  endTime?: string;
  location: string;
  detailedAddress?: string;
  description: string;
  seatInfo?: string;
  posterUrl?: string;
  organizer?: { name: string };
  tickets: Ticket[];
  extraQuestions?: Question[];
}

export interface Ticket {
  id: string;
  name: string;
  price: number;
  totalQty: number;
  soldQty: number;
}

export interface Purchase {
  id: string;
  ticketNumber: string;
  eventId: string;
  ticketId: string;
  buyerName: string;
  buyerPhone: string;
  paidAmount: number;
  paymentId: string;
  payMethod: string;
  checkedIn: boolean;
  checkedInAt?: string;
  createdAt: string;
  event?: Event;
  ticket?: Ticket;
}

export interface Question {
  id: string;
  label: string;
  options?: string[];
}
