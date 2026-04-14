"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MobileContainer from "@/components/layout/MobileContainer";

export default function PaymentProcessingPage() {
  const router = useRouter();
  const [payInfo, setPayInfo] = useState<{
    eventTitle: string;
    ticketName: string;
    amount: number;
  } | null>(null);
  const [dots, setDots] = useState(0);

  useEffect(() => {
    // Prevent back navigation
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Load payment info from session
    const info = sessionStorage.getItem("haven_payment_info");
    if (info) setPayInfo(JSON.parse(info));

    // Animate dots
    const dotsInterval = setInterval(() => {
      setDots((d) => (d + 1) % 3);
    }, 500);

    // Poll for payment completion (webhook will update DB)
    const paymentId = sessionStorage.getItem("haven_payment_id");
    const purchaseId = sessionStorage.getItem("haven_purchase_id");

    const pollInterval = setInterval(async () => {
      if (!purchaseId) return;
      try {
        const res = await fetch(`/api/purchases/${purchaseId}/status`);
        const { status, ticketId } = await res.json();
        if (status === "paid") {
          clearInterval(pollInterval);
          sessionStorage.removeItem("haven_payment_id");
          sessionStorage.removeItem("haven_purchase_id");
          sessionStorage.removeItem("haven_payment_info");
          router.replace(`/payment/success?ticketId=${ticketId}`);
        }
      } catch {
        // Continue polling
      }
    }, 1500);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      clearInterval(dotsInterval);
      clearInterval(pollInterval);
    };
  }, [router]);

  return (
    <MobileContainer className="bg-white">
      {/* Status bar placeholder */}
      <div className="h-11" />

      {/* Header */}
      <div className="h-[52px] flex items-center justify-center border-b border-[#f0f0f0]">
        <span className="text-[16px] font-semibold text-[#111]">결제</span>
      </div>

      {/* Main content */}
      <div className="flex flex-col items-center justify-center flex-1 py-20">
        {/* Spinner */}
        <div className="relative w-[72px] h-[72px] mb-8">
          <svg
            className="animate-spin"
            width="72"
            height="72"
            viewBox="0 0 72 72"
            fill="none"
          >
            <circle cx="36" cy="36" r="30" stroke="#d6d0fc" strokeWidth="6" />
            <path
              d="M36 6a30 30 0 0 1 30 30"
              stroke="#5a42f5"
              strokeWidth="6"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-5 h-[14px] bg-[#d6d0fc] rounded-[3px] relative">
              <div className="absolute inset-x-0 top-0 h-[5px] bg-[#5a42f5] rounded-[2px]" />
              <div className="absolute left-[3px] bottom-[3px] w-1.5 h-1.5 bg-white rounded-[1px]" />
              <div className="absolute right-[3px] bottom-[3px] w-1.5 h-1.5 bg-white rounded-[1px]" />
            </div>
          </div>
        </div>

        <h2 className="text-[18px] font-semibold text-[#111] mb-3">
          결제를 처리하고 있어요
        </h2>
        <div className="text-center text-[13px] text-[#888] leading-[22px]">
          <p>잠시만 기다려주세요</p>
          <p>창을 닫거나 뒤로 가지 마세요</p>
        </div>

        {/* Animated dots */}
        <div className="flex gap-[10px] mt-8">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                i === dots ? "bg-[#5a42f5]" : "bg-[#cccccc]"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Ticket info card */}
      {payInfo && (
        <div className="mx-5 bg-[#f7f7f8] rounded-[16px] px-4 py-5 mb-6">
          <p className="text-[12px] text-[#aaaaaa] mb-2">결제 중인 티켓</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[14px] font-semibold text-[#111]">{payInfo.eventTitle}</p>
              <p className="text-[12px] text-[#888] mt-0.5">{payInfo.ticketName}</p>
            </div>
            <span className="text-[15px] font-semibold text-[#5a42f5]">
              {payInfo.amount.toLocaleString("ko-KR")}원
            </span>
          </div>
        </div>
      )}

      <p className="text-center text-[11px] text-[#aaaaaa] pb-8">Portone 보안 결제</p>
    </MobileContainer>
  );
}
