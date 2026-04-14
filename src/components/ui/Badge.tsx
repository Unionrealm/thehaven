type BadgeVariant = "primary" | "success" | "warning" | "gray" | "dark";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  primary: "bg-[#ece8ff] text-[#5a42f5]",
  success: "bg-[#e6f9f4] text-[#00c49a]",
  warning: "bg-[#fef6e4] text-[#f5a800]",
  gray: "bg-[#f5f5f6] text-[#aaaaaa]",
  dark: "bg-[#111] text-white",
};

export default function Badge({ children, variant = "primary", className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-3 py-0.5 rounded-[11px] text-[11px] font-medium whitespace-nowrap ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
