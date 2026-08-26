import Link from "next/link";
import { signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { deriveInitials } from "@/lib/initials";
import { BackButton } from "@/components/back-button";
import { NotificationBell } from "@/components/notification-bell";
import { NavLinks, type NavItem } from "@/components/nav-links";
import { TextScaleToggle } from "@/components/text-scale-toggle";

export async function DashboardShell({
  title,
  orgName,
  userName,
  userRoleLabel,
  userId,
  nav,
  children,
}: {
  title: string;
  orgName: string;
  userName: string;
  userRoleLabel: string;
  userId: string;
  nav: NavItem[];
  children: React.ReactNode;
}) {
  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 15,
  });
  const unreadCount = notifications.filter((n) => !n.read).length;
  const initials = deriveInitials(userName).slice(0, 2) || "?";

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-3 pt-3 sm:px-6 sm:pt-4">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center gap-1 overflow-x-auto rounded-full bg-purple-600 py-2 pl-2 pr-3 text-white shadow-md">
            <BackButton className="text-white/70 hover:bg-white/15 hover:text-white shrink-0" />
            <Link href="/" className="flex shrink-0 items-center gap-2 px-2 hover:opacity-90">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-xs font-black text-purple-600">
                F
              </span>
              <span className="hidden text-sm font-extrabold sm:inline" style={{ fontFamily: "var(--font-heading)" }}>
                FromTo
              </span>
            </Link>
            <span className="hidden h-5 w-px shrink-0 bg-white/25 sm:block" />
            <div className="hidden flex-col leading-tight sm:flex">
              <span className="text-[10px] font-bold uppercase tracking-wide text-white/60">{title}</span>
              <span className="text-sm font-bold">{orgName}</span>
            </div>
            <span className="mx-1 hidden h-5 w-px shrink-0 bg-white/25 lg:block" />

            <NavLinks nav={nav} className="ml-1 hidden items-center gap-0.5 lg:flex" />

            <div className="flex-1" />

            <TextScaleToggle className="hidden shrink-0 rounded-full px-2 py-1.5 text-xs font-black text-white/80 hover:bg-white/15 hover:text-white sm:inline-flex" />

            <NotificationBell
              notifications={notifications.map((n) => ({
                id: n.id,
                type: n.type,
                title: n.title,
                body: n.body,
                link: n.link,
                read: n.read,
                createdAt: n.createdAt.toISOString(),
              }))}
              unreadCount={unreadCount}
              className="shrink-0 text-white/80 hover:bg-white/15 hover:text-white"
            />

            <span className="mx-1 hidden h-5 w-px shrink-0 bg-white/25 sm:block" />

            <div className="hidden shrink-0 items-center gap-2 rounded-full bg-white/15 py-1 pl-1 pr-3 sm:flex">
              <span className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-white text-[10px] font-extrabold text-purple-600">
                {initials}
              </span>
              <span className="flex flex-col leading-tight">
                <span className="text-[9px] font-bold uppercase tracking-wide text-white/60">{userRoleLabel}</span>
                <span className="whitespace-nowrap text-xs font-bold">{userName}</span>
              </span>
            </div>

            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
              className="shrink-0"
            >
              <button
                className="rounded-full p-1.5 text-white/70 hover:bg-white/15 hover:text-white cursor-pointer"
                aria-label="Esci"
              >
                <svg viewBox="0 0 24 24" fill="none" className="h-[18px] w-[18px]" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <path d="M16 17l5-5-5-5" />
                  <path d="M21 12H9" />
                </svg>
              </button>
            </form>
          </div>

          <NavLinks nav={nav} variant="light" className="flex gap-1 overflow-x-auto px-1 py-2 lg:hidden" />
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}
