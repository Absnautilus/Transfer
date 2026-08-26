"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavIcon } from "@/components/nav-icons";

export type NavItem = { href: string; label: string; icon?: string };

export function NavLinks({
  nav,
  className,
  variant = "dark",
}: {
  nav: NavItem[];
  className?: string;
  variant?: "dark" | "light";
}) {
  const pathname = usePathname();
  return (
    <nav className={className}>
      {nav.map((item) => {
        const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);
        const linkClass =
          variant === "dark"
            ? active
              ? "bg-white/20 text-white"
              : "text-white/70 hover:bg-white/15 hover:text-white"
            : active
              ? "bg-purple-600 text-white shadow-sm"
              : "bg-white text-slate-600 shadow-sm hover:text-purple-600";
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 text-[13px] font-bold transition-colors ${linkClass}`}
          >
            {item.icon && <NavIcon name={item.icon} className="h-[15px] w-[15px] shrink-0" />}
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
