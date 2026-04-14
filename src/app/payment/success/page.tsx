"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import MobileContainer from "@/components/layout/MobileContainer";
import { motion } from "framer-motion";

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ticketId = searchParams.get("ticketId");
  const [ticketNumber, setTicketNumber] = useState("");

  useEffect(() => {
    if (!ticketId) {
      router.replace("/");
      return;
    }

    // Fetch ticket number
    fetch(`/api/tickets/${ticketId}`)
      .then((r) => r.json())
      .then((d) => setTicketNumber(d.ticketNumber || ""))
      .catch(() => {});

    // Auto-redirect after 1.5s
    const timer = setTimeout(() => {
      router.replace(`/tickets/${ticketId}`);
    }, 1500);

    return () => clearTimeout(timer);
  }, [ticketId, router]);

  return (
    <MobileContainer className="bg-[#5a42f5]">
      {/* Status bar */}
      <div className="h-11" />

      {/* Ripple circles */}
      <div className="flex flex-col items-center justify-center pt-28">
        <div className="relative flex items-center justify-center mb-8">
          {[200, 144, 96, 72, 56].map((size, i) => (
            <motion.div
              key={size}
              className="absolute rounded-full bg-white/10"
              style={{ width: size, height: size }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
            />
          ))}
          <div className="relative z-10 w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M5 13l4 4L19 7" stroke="#5a42f5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        <h1 className="text-[28px] font-bold text-white tracking-[-0.8px] mb-2">결제 완료!</h1>
        <p className="text-[15px] text-white/75">티켓을 발행하고 있어요</p>
      </div>

      {/* Ticket preview card */}
      {ticketNumber && (
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mx-5 mt-12 rounded-[20px] bg-white/15 px-5 py-5"
        >
          <p className="text-[18px] font-bold text-white tracking-[-0.5px]">
            #{ticketNumber}
          </p>
          <p className="text-[12px] text-white/70 mt-1">티켓이 발행되었습니다</p>
        </motion.div>
      )}

      {/* Redirect hint */}
      <p className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[14px] text-white/60 whitespace-nowrap">
        티켓 확인하기 →
      </p>
    </MobileContainer>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense>
      <PaymentSuccessContent />
    </Suspense>
  );
}
