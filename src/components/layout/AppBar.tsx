"use client";

import { useRouter } from "next/navigation";

interface AppBarProps {
  title?: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
  showLogo?: boolean;
}

export default function AppBar({
  title,
  showBack = false,
  rightAction,
  showLogo = false,
}: AppBarProps) {
  const router = useRouter();

  return (
    <div className="sticky top-0 z-10 bg-white">
      <div className="h-11 bg-white" />
      <div className="h-12 bg-white flex items-center px-5 relative">
        {showBack && (
          <button
            onClick={() => router.back()}
            className="absolute left-5 flex items-center justify-center w-6 h-6"
            aria-label="뒤로가기"
          >
            <svg width="9" height="16" viewBox="0 0 9 16" fill="none">
              <path d="M8 1L1 8L8 15" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
        {showLogo && (
          <span className="font-bold text-primary text-[18px] tracking-[-0.5px]" style={{ fontFamily: "'Palanquin', sans-serif" }}>
            haven
          </span>
        )}
        {title && (
          <span className="absolute left-1/2 -translate-x-1/2 font-semibold text-[#111] text-[16px]">
            {title}
          </span>
        )}
        {rightAction && (
          <div className="absolute right-5">{rightAction}</div>
        )}
      </div>
      <div className="h-px bg-[#f0f0f0]" />
    </div>
  );
}
