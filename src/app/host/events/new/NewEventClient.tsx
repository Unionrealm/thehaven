"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

const CATEGORIES = ["인디음악", "공연/뮤지컬", "원데이클래스", "언어교환", "기타"];
const QUESTION_TEMPLATES = ["식이제한 여부", "참여 경험", "한국어/영어 선호", "직접 입력"];

interface TicketInput {
  name: string;
  price: string;
  qty: string;
}

export default function NewEventClient() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  // Section 1: Basic info
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [posterPreview, setPosterPreview] = useState("");
  const [eventName, setEventName] = useState("");
  const [category, setCategory] = useState("인디음악");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");

  // Section 2: Description
  const [description, setDescription] = useState("");
  const [seatInfo, setSeatInfo] = useState("");

  // Section 3: Tickets
  const [tickets, setTickets] = useState<TicketInput[]>([{ name: "", price: "", qty: "" }]);
  const [saleDeadline, setSaleDeadline] = useState("");

  // Section 4: Questions
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Calculate progress
  const progress = [
    eventName && category && date && time && location,
    description,
    tickets[0].name && tickets[0].price && tickets[0].qty,
    true, // optional section
  ].filter(Boolean).length / 4;

  function handlePosterChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPosterFile(file);
    setPosterPreview(URL.createObjectURL(file));
  }

  function addTicket() {
    if (tickets.length >= 5) return;
    setTickets([...tickets, { name: "", price: "", qty: "" }]);
  }

  function removeTicket(i: number) {
    setTickets(tickets.filter((_, idx) => idx !== i));
  }

  function updateTicket(i: number, field: keyof TicketInput, value: string) {
    const updated = [...tickets];
    updated[i] = { ...updated[i], [field]: value };
    setTickets(updated);
  }

  function toggleQuestion(q: string) {
    setSelectedQuestions((prev) =>
      prev.includes(q) ? prev.filter((x) => x !== q) : [...prev, q]
    );
  }

  async function handleSubmit() {
    setFormError(null);
    if (!eventName || !category || !date || !time || !location || !description) {
      setFormError("필수 항목을 모두 입력해주세요.");
      return;
    }
    setLoading(true);

    const formData = new FormData();
    if (posterFile) formData.append("poster", posterFile);
    formData.append("eventName", eventName);
    formData.append("category", category);
    formData.append("date", `${date}T${time}`);
    formData.append("endTime", endTime);
    formData.append("location", location);
    formData.append("description", description);
    formData.append("seatInfo", seatInfo);
    formData.append("tickets", JSON.stringify(tickets));
    formData.append("saleDeadline", saleDeadline);
    formData.append("questions", JSON.stringify(selectedQuestions));

    try {
      const res = await fetch("/api/events", { method: "POST", body: formData });
      const data = (await res.json().catch(() => ({}))) as {
        eventId?: string;
        error?: string;
      };

      if (!res.ok || !data.eventId) {
        setFormError(
          data.error ?? `이벤트 생성에 실패했어요. (HTTP ${res.status})`
        );
        setLoading(false);
        return;
      }

      router.push(`/host/events/${data.eventId}`);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "알 수 없는 오류가 발생했어요.";
      setFormError(`네트워크 오류로 이벤트를 만들 수 없어요: ${message}`);
      setLoading(false);
    }
  }

  return (
    <div className="pb-24">
      {/* Progress bar */}
      <div className="h-[3px] bg-[#f0f0f0] relative">
        <div
          className="absolute h-full bg-[#5a42f5] transition-all duration-300"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
      <div className="h-[10px] bg-[#f7f7f8]" />

      {/* Section 1: Basic info */}
      <div className="bg-white px-5 py-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-[22px] h-[22px] bg-[#5a42f5] rounded-[6px] flex items-center justify-center">
            <span className="text-[12px] font-bold text-white">1</span>
          </div>
          <span className="text-[15px] font-semibold text-[#111]">기본 정보</span>
        </div>

        {/* Poster upload */}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePosterChange} />
        <button
          onClick={() => fileRef.current?.click()}
          className="w-full h-[168px] bg-[#f0edff] border-[1.5px] border-dashed border-[#c8c0fc] rounded-[16px] flex flex-col items-center justify-center mb-5"
        >
          {posterPreview ? (
            <img src={posterPreview} alt="포스터" className="w-full h-full object-cover rounded-[16px]" />
          ) : (
            <>
              <div className="w-9 h-9 bg-[#c8c0fc]/60 rounded-[8px] flex items-center justify-center mb-2">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 3v10M3 8h10" stroke="#5a42f5" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <p className="text-[14px] font-medium text-[#5a42f5]">포스터 이미지 추가</p>
              <p className="text-[12px] text-[#aaaaaa] mt-1">JPG, PNG · 최대 10MB</p>
            </>
          )}
        </button>

        {/* Event name */}
        <div className="mb-4">
          <label className="block text-[13px] font-medium text-[#555] mb-2">이벤트 이름</label>
          <input
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            placeholder="이벤트 이름을 입력하세요"
            className="w-full h-12 bg-[#f5f5f6] rounded-[12px] px-4 text-[14px] placeholder:text-[#cccccc] focus:outline-none focus:bg-white focus:border focus:border-[#5a42f5]"
          />
        </div>

        {/* Category */}
        <div className="mb-4">
          <label className="block text-[13px] font-medium text-[#555] mb-2">카테고리</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`h-[34px] px-4 rounded-[20px] text-[13px] border transition-colors ${
                  category === cat
                    ? "bg-[#5a42f5] border-[#5a42f5] text-white"
                    : "bg-white border-[#e8e8e8] text-[#888]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Date & Time */}
        <div className="mb-4">
          <label className="block text-[13px] font-medium text-[#555] mb-2">날짜 및 시간</label>
          <div className="flex gap-2">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="flex-1 h-12 bg-[#f5f5f6] rounded-[12px] px-4 text-[14px] text-[#cccccc] focus:outline-none"
            />
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="flex-1 h-12 bg-[#f5f5f6] rounded-[12px] px-4 text-[14px] text-[#cccccc] focus:outline-none"
            />
          </div>
        </div>

        {/* End time */}
        <div className="mb-4">
          <label className="block text-[13px] font-medium text-[#555] mb-2">
            종료 시간 <span className="text-[11px] text-[#aaaaaa]">선택</span>
          </label>
          <input
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            placeholder="종료 시간을 입력하세요 (예: 오후 9:00)"
            className="w-full h-12 bg-[#f5f5f6] rounded-[12px] px-4 text-[14px] placeholder:text-[#cccccc] focus:outline-none"
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-[13px] font-medium text-[#555] mb-2">장소</label>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="장소를 입력하세요"
            className="w-full h-12 bg-[#f5f5f6] rounded-[12px] px-4 text-[14px] placeholder:text-[#cccccc] focus:outline-none"
          />
          <p className="text-[12px] text-[#aaaaaa] mt-1.5">
            정확한 주소는 결제 완료 후 공개할 수 있어요
          </p>
        </div>
      </div>

      <div className="h-[10px] bg-[#f7f7f8]" />

      {/* Section 2: Description */}
      <div className="bg-white px-5 py-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-[22px] h-[22px] bg-[#5a42f5] rounded-[6px] flex items-center justify-center">
            <span className="text-[12px] font-bold text-white">2</span>
          </div>
          <span className="text-[15px] font-semibold text-[#111]">이벤트 소개</span>
        </div>

        <div className="mb-4">
          <label className="block text-[13px] font-medium text-[#555] mb-2">상세 설명</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value.slice(0, 500))}
            placeholder={`이벤트를 소개해주세요.\n어떤 경험을 할 수 있는지 알려주시면 좋아요.`}
            rows={4}
            className="w-full bg-[#f5f5f6] rounded-[12px] px-4 py-3 text-[14px] placeholder:text-[#cccccc] focus:outline-none resize-none"
          />
          <div className="text-right text-[11px] text-[#cccccc] mt-1">
            {description.length}/500
          </div>
        </div>

        <div>
          <label className="block text-[13px] font-medium text-[#555] mb-2">
            자리 안내 <span className="text-[11px] text-[#aaaaaa]">선택</span>
          </label>
          <textarea
            value={seatInfo}
            onChange={(e) => setSeatInfo(e.target.value)}
            placeholder={`좌석 구성, 스탠딩 여부 등 자리 안내를 입력하세요.\n예) 전석 자유석, 40석 + 스탠딩 구역`}
            rows={3}
            className="w-full bg-[#f5f5f6] rounded-[12px] px-4 py-3 text-[14px] placeholder:text-[#cccccc] focus:outline-none resize-none"
          />
        </div>
      </div>

      <div className="h-[10px] bg-[#f7f7f8]" />

      {/* Section 3: Tickets */}
      <div className="bg-white px-5 py-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-[22px] h-[22px] bg-[#5a42f5] rounded-[6px] flex items-center justify-center">
            <span className="text-[12px] font-bold text-white">3</span>
          </div>
          <span className="text-[15px] font-semibold text-[#111]">티켓 설정</span>
        </div>

        {tickets.map((ticket, i) => (
          <div key={i} className="bg-[#f7f7f8] rounded-[16px] p-4 mb-3">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[13px] font-semibold text-[#555]">티켓 {i + 1}</span>
              {tickets.length > 1 && (
                <button
                  onClick={() => removeTicket(i)}
                  className="w-[18px] h-[18px] bg-[#e8e8e8] rounded-[9px] flex items-center justify-center"
                >
                  <span className="text-[13px] text-[#888]">×</span>
                </button>
              )}
            </div>
            <div className="mb-3">
              <label className="block text-[13px] font-medium text-[#555] mb-1.5">티켓 이름</label>
              <input
                value={ticket.name}
                onChange={(e) => updateTicket(i, "name", e.target.value)}
                placeholder="예) 일반 입장, VIP, 얼리버드"
                className="w-full h-11 bg-white rounded-[10px] px-4 text-[14px] placeholder:text-[#cccccc] focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-[13px] font-medium text-[#555] mb-1.5">가격</label>
                <div className="flex items-center bg-white rounded-[10px] h-10 px-4">
                  <input
                    type="number"
                    value={ticket.price}
                    onChange={(e) => updateTicket(i, "price", e.target.value)}
                    placeholder="0"
                    className="flex-1 text-[14px] placeholder:text-[#cccccc] focus:outline-none"
                  />
                  <span className="text-[14px] text-[#aaaaaa]">원</span>
                </div>
              </div>
              <div className="flex-1">
                <label className="block text-[13px] font-medium text-[#555] mb-1.5">수량</label>
                <div className="flex items-center bg-white rounded-[10px] h-10 px-4">
                  <input
                    type="number"
                    value={ticket.qty}
                    onChange={(e) => updateTicket(i, "qty", e.target.value)}
                    placeholder="0"
                    className="flex-1 text-[14px] placeholder:text-[#cccccc] focus:outline-none"
                  />
                  <span className="text-[14px] text-[#aaaaaa]">매</span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {tickets.length < 5 && (
          <button
            onClick={addTicket}
            className="w-full h-12 border border-[#5a42f5] rounded-[12px] text-[14px] font-medium text-[#5a42f5] mb-4"
          >
            + 티켓 종류 추가
          </button>
        )}

        <div>
          <label className="block text-[13px] font-medium text-[#555] mb-2">
            판매 마감일 <span className="text-[11px] text-[#aaaaaa]">선택</span>
          </label>
          <div className="relative h-12 bg-[#f5f5f6] rounded-[12px] flex items-center px-4">
            <input
              type="date"
              value={saleDeadline}
              onChange={(e) => setSaleDeadline(e.target.value)}
              className="w-full bg-transparent text-[14px] text-[#aaaaaa] focus:outline-none"
            />
            {!saleDeadline && (
              <span className="absolute left-4 text-[14px] text-[#aaaaaa] pointer-events-none">
                이벤트 당일까지 판매
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="h-[10px] bg-[#f7f7f8]" />

      {/* Section 4: Extra questions */}
      <div className="bg-white px-5 py-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-[22px] h-[22px] bg-[#5a42f5] rounded-[6px] flex items-center justify-center">
            <span className="text-[12px] font-bold text-white">4</span>
          </div>
          <span className="text-[15px] font-semibold text-[#111]">추가 질문</span>
        </div>
        <p className="text-[13px] text-[#888] mb-4 leading-[20px]">
          구매자에게 추가로 물어볼 내용이 있으면 질문을 추가하세요.
        </p>
        <div className="flex flex-wrap gap-2">
          {QUESTION_TEMPLATES.map((q) => (
            <button
              key={q}
              onClick={() => toggleQuestion(q)}
              className={`h-8 px-4 rounded-[20px] text-[13px] border transition-colors ${
                selectedQuestions.includes(q)
                  ? "bg-[#5a42f5] border-[#5a42f5] text-white"
                  : "bg-white border-[#e8e8e8] text-[#555]"
              }`}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[375px] bg-white border-t border-[#f0f0f0] px-5 py-4">
        {formError ? (
          <div className="mb-3 px-3 py-2 bg-[#fff1f1] border border-[#ffd9d9] rounded-[10px]">
            <p className="text-[12px] text-[#d23f3f] leading-[18px] whitespace-pre-wrap">
              {formError}
            </p>
          </div>
        ) : (
          <p className="text-center text-[13px] text-[#aaaaaa] mb-3">
            링크를 공유하면 바로 판매 시작!
          </p>
        )}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full h-[50px] bg-[#5a42f5] rounded-[16px] text-[16px] font-semibold text-white disabled:opacity-50"
        >
          {loading ? "생성 중..." : "이벤트 오픈하기"}
        </button>
      </div>
    </div>
  );
}
