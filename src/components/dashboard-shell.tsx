import Link from "next/link";
import { signOut } from "@/auth";
import { cn } from "@/lib/cn";

export function DashboardShell({
  title,
  orgName,
  userName,
  nav,
  children,
}: {
  title: string;
  orgName: string;
  userName: string;
  nav: { href: string; label: string }[];
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">{title}</p>
            <p className="font-semibold text-slate-900">{orgName}</p>
          </div>
          <nav className="hidden gap-1 sm:flex">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn("rounded-md px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100")}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500">{userName}</span>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            >
              <button className="text-sm font-medium text-slate-500 hover:text-slate-900 cursor-pointer">Esci</button>
            </form>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto border-t border-slate-100 px-4 py-1 sm:hidden">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100">
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}
