import Link from "next/link";
import MobileContainer from "@/components/layout/MobileContainer";

export default function Home() {
  return (
    <MobileContainer className="bg-white flex flex-col items-center justify-center">
      <div className="px-8 py-20 flex flex-col items-center gap-6 text-center">
        <h1
          className="text-[32px] font-bold text-[#5a42f5] tracking-[-1px]"
        >
          haven
        </h1>
        <p className="text-[16px] text-[#555] leading-[26px]">
          링크 하나로 티켓을 판매하세요.
          <br />
          회원가입 없이 간편하게.
        </p>
        <Link
          href="/host/events/new"
          className="mt-4 w-full h-[52px] bg-[#5a42f5] rounded-[16px] text-[16px] font-semibold text-white flex items-center justify-center"
        >
          이벤트 만들기
        </Link>
      </div>
    </MobileContainer>
  );
}
