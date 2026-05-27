"use client";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useTheme } from "@/components/theme-provider";
import { Moon, Plus, Search, Sun } from "lucide-react";
import { Logo } from "@/components/logo";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function Header() {
  const { data: session } = useSession();
  const { theme, toggle } = useTheme();
  const pathname = usePathname() || "/";
  const [showSearch, setShowSearch] = useState(false);

  const NAV = [
    { href: "/", label: "首页", match: (p: string) => p === "/" || p.startsWith("/apps") },
    { href: "/circles", label: "社区", match: (p: string) => p.startsWith("/circles") || p.startsWith("/post") },
    { href: "/services", label: "技能", match: (p: string) => p.startsWith("/services") },
    { href: "/me", label: "我的", match: (p: string) => p.startsWith("/me") || p.startsWith("/settings") },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-[rgb(var(--border))] bg-[rgb(var(--bg))]/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4">
        <Link href="/" className="flex shrink-0 items-center gap-2 font-bold text-base">
          <Logo size={28} />
          <span className="bg-gradient-to-br from-brand-500 to-brand-800 bg-clip-text text-transparent">
            AIUG
          </span>
        </Link>

        {/* 桌面端导航 */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "btn-ghost",
                item.match(pathname) && "bg-[rgb(var(--hover))] text-brand-600"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* 搜索 - 桌面端始终显示 */}
        <form action="/search" className="ml-auto hidden sm:block flex-1 max-w-xs">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(var(--muted))]" />
            <input name="q" className="input pl-9" placeholder="搜索应用、帖子、技能..." />
          </div>
        </form>

        {/* 移动端搜索按钮 */}
        <button
          onClick={() => setShowSearch(!showSearch)}
          className="btn-ghost px-2 sm:hidden ml-auto"
          type="button"
        >
          <Search className="h-4 w-4" />
        </button>

        <button onClick={toggle} className="btn-ghost px-2" title="切换主题" type="button">
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        {session?.user ? (
          <Link href="/post/new" className="btn-primary shrink-0">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">发布</span>
          </Link>
        ) : (
          <Link href="/login" className="btn-primary shrink-0 text-sm">
            登录
          </Link>
        )}
      </div>

      {/* 移动端搜索展开 */}
      {showSearch && (
        <div className="border-t border-[rgb(var(--border))] px-4 py-2 sm:hidden">
          <form action="/search">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(var(--muted))]" />
              <input
                name="q"
                className="input pl-9"
                placeholder="搜索应用、帖子、技能..."
                autoFocus
              />
            </div>
          </form>
        </div>
      )}
    </header>
  );
}