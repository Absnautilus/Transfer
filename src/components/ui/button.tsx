import { cn } from "@/lib/cn";
import Link from "next/link";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost" | "outline";
type Size = "sm" | "md";

const variants: Record<Variant, string> = {
  primary: "bg-purple-600 text-white hover:bg-purple-500 disabled:bg-purple-300",
  secondary: "bg-purple-100 text-purple-800 hover:bg-purple-200 disabled:bg-purple-50 disabled:text-purple-300",
  danger: "bg-red-100 text-red-600 border border-red-300 hover:bg-red-200 disabled:bg-red-50 disabled:text-red-300",
  ghost: "bg-transparent text-slate-700 hover:bg-slate-100",
  outline: "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50",
};

const sizes: Record<Size, string> = {
  sm: "px-2.5 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
};

const base =
  "inline-flex items-center justify-center gap-1.5 rounded-md font-bold transition-[filter,transform,box-shadow] duration-150 hover:-translate-y-px hover:shadow-sm active:translate-y-px active:shadow-none disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none cursor-pointer";

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return <button className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}

export function LinkButton({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
}: {
  href: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={cn(base, variants[variant], sizes[size], className)}>
      {children}
    </Link>
  );
}
