import MobileContainer from "@/components/layout/MobileContainer";
import AppBar from "@/components/layout/AppBar";
import NewEventClient from "./NewEventClient";

export default function NewEventPage() {
  return (
    <MobileContainer>
      <AppBar
        title="이벤트 만들기"
        showBack
        rightAction={
          <button className="text-[14px] font-medium text-[#aaaaaa]">임시저장</button>
        }
      />
      <NewEventClient />
    </MobileContainer>
  );
}
