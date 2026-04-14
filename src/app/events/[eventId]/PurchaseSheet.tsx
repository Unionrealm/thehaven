"use client";

import { useState } from "react";
import BottomSheet from "@/components/ui/BottomSheet";
import { Ticket } from "@/lib/types";

interface PurchaseSheetProps {
  open: boolean;
  onClose: () => void;
  ticket: Ticket;
  eventTitle: string;
  onPay: (name: string, phone: string, payMethod: string) => void;
}

const PAY_METHODS = [
  { id: "KAKAO_PAY", label: "카카오페이" },
  { id: "TOSS_PAY", label: "토스페이" },
  { id: "CARD", label: "신용카드" },
];

function formatPrice(price: number) {
  return price.toLocaleString("ko-KR");
}

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

export default function PurchaseSheet({
  open,
  onClose,
  ticket,
  eventTitle,
  onPay,
}: PurchaseSheetProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [payMethod, setPayMethod] = useState("KAKAO_PAY");

  const canPay = name.trim().length > 0 && phone.replace(/\D/g, "").length === 11;

  return (
    <BottomSheet open={open} onClose={onClose}>
      <div className="px-5 pb-8">
        {/* Selected ticket summary */}
        <div className="bg-[#f7f7f8] rounded-[14px] px-4 py-3 flex items-center justify-between mb-6">
          <div>
            <p className="text-[12px] text-[#888] mb-0.5">선택한 티켓</p>
            <p className="text-[15px] font-medium text-[#111]">{ticket.name}</p>
          </div>
          <span className="text-[18px] font-semibold text-[#111] tracking-[-0.5px]">
            {formatPrice(ticket.price)}원
          </span>
        </div>

        {/* Name input */}
        <div className="mb-4">
          <label className="block text-[13px] font-medium text-[#555] mb-2">이름</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="홍길동"
            className="w-full h-[46px] bg-[#fafafa] border border-[#ccc] rounded-[12px] px-4 text-[15px] placeholder:text-[#888] focus:outline-none focus:border-[#5a42f5]"
          />
        </div>

        {/* Phone input */}
        <div className="mb-1">
          <label className="block text-[13px] font-medium text-[#555] mb-2">연락처</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(formatPhone(e.target.value))}
            placeholder="010-0000-0000"
            className="w-full h-[46px] bg-[#fafafa] border border-[#ccc] rounded-[12px] px-4 text-[15px] placeholder:text-[#888] focus:outline-none focus:border-[#5a42f5]"
          />
        </div>
        <p className="text-[12px] text-[#888] mb-6">
          주최자에게만 공개 · 공연 안내 등에 사용됩니다
        </p>

        {/* Payment method */}
        <div className="mb-6">
          <p className="text-[13px] font-medium text-[#555] mb-3">결제 수단</p>
          <div className="grid grid-cols-3 gap-2">
            {PAY_METHODS.map((method) => (
              <button
                key={method.id}
                onClick={() => setPayMethod(method.id)}
                className={`h-16 rounded-[12px] flex flex-col items-center justify-center gap-1 border transition-colors ${
                  payMethod === method.id
                    ? "bg-[#f8f7ff] border-[#5a42f5] border-[1.5px]"
                    : "bg-white border-[#ebebeb]"
                }`}
              >
                {method.id === "KAKAO_PAY" && (
                  <div className="w-[60px] h-[22px] bg-[#ffcd00] rounded-[3px]" />
                )}
                {method.id === "TOSS_PAY" && (
                  <div className="w-5 h-5 rounded-full bg-[#0064ff]" />
                )}
                {method.id === "CARD" && (
                  <div className="w-[60px] h-[22px] bg-white border border-[#ccc] rounded-[3px]" />
                )}
                <span
                  className={`text-[11px] ${
                    payMethod === method.id ? "text-[#5a42f5]" : "text-[#888]"
                  }`}
                >
                  {method.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Pay button */}
        <button
          onClick={() => canPay && onPay(name, phone, payMethod)}
          disabled={!canPay}
          className={`w-full h-[52px] rounded-[14px] text-[16px] font-semibold text-white tracking-[-0.3px] transition-opacity ${
            canPay ? "bg-[#5a42f5]" : "bg-[#5a42f5] opacity-50"
          }`}
        >
          {formatPrice(ticket.price)}원 결제하기
        </button>

        <p className="text-center text-[11px] text-[#888] mt-3">
          결제 시 Haven 이용약관에 동의하는 것으로 간주됩니다
        </p>
      </div>
    </BottomSheet>
  );
}
