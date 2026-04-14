export default function MobileContainer({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`max-w-[375px] mx-auto min-h-screen bg-[#f7f7f8] ${className}`}>
      {children}
    </div>
  );
}
