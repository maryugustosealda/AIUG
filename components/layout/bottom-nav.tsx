"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, Briefcase, User } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  {
    href: "/",
    label: "首页",
    icon: Home,
    match: (p: string) => p === "/" || p.startsWith("/apps"),
  },
  {
    href: "/circles",
    label: "社区",
    icon: Users,
    match: (p: string) =>
      p === "/circles" || p.startsWith("/circles/") || p.startsWith("/post"),
  },
  {
    href: "/services",
    label: "技能",
    icon: Briefcase,
    match: (p: string) => p === "/services" || p.startsWith("/services/"),
  },
  {
    href: "/me",
    label: "我的",
    icon: User,
    match: (p: string) =>
      p === "/me" ||
      p.startsWith("/me/") ||
      p === "/settings" ||
      p.startsWith("/settings"),
  },
] as const;

export default function BottomNav() {
  const pathname = usePathname() || "/";

  if (pathname.startsWith("/login") || pathname.startsWith("/register") || pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-[rgb(var(--border))]/60 bg-[rgb(var(--bg))]/80 backdrop-blur-xl md:hidden"
      aria-label="主导航"
    >
      <div className="mx-auto flex h-16 max-w-6xl items-stretch justify-around px-2 pb-[env(safe-area-inset-bottom)]">
        {TABS.map(({ href, label, icon: Icon, match }) => {
          const active = match(pathname);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-all duration-200 relative",
                active ? "text-[rgb(var(--accent))]" : "text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))]"
              )}
            >
              {active && (
                <span className="absolute -top-px left-1/2 -translate-x-1/2 h-0.5 w-6 rounded-full bg-[rgb(var(--accent))]" />
              )}
              <Icon className={cn("h-5 w-5 transition-transform", active && "stroke-[2.5] scale-110")} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}