"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "@/components/theme-provider";
import { Bell, Moon, Plus, Search, Sun, User as UserIcon, LogOut, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { Logo } from "@/components/logo";

export default function Header() {
  const { data: session } = useSession();
  const { theme, toggle } = useTheme();
  const [unread, setUnread] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!session?.user) return;
    fetch("/api/notifications/unread-count")
      .then((r) => r.json())
      .then((d) => setUnread(d.count ?? 0))
      .catch(() => {});
  }, [session]);

  return (
    <header className="sticky top-0 z-40 border-b border-[rgb(var(--border))] bg-[rgb(var(--bg))]/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-base">
          <Logo size={30} />
          <span className="bg-gradient-to-br from-brand-500 to-brand-800 bg-clip-text text-transparent">AIUG</span>
          <span className="hidden sm:inline text-sm font-medium text-[rgb(var(--muted))]">创作者社区</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 text-sm">
          <Link href="/" className="btn-ghost">广场</Link>
          <Link href="/apps" className="btn-ghost">应用</Link>
          <Link href="/services" className="btn-ghost">技能</Link>
          <Link href="/circles" className="btn-ghost">圈子</Link>
          <Link href="/chat" className="btn-ghost">群组</Link>
          <Link href="/creators" className="btn-ghost">创作者</Link>
        </nav>

        <form action="/search" className="ml-auto hidden md:block flex-1 max-w-xs">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(var(--muted))]" />
            <input name="q" className="input pl-9" placeholder="搜索应用、帖子、用户" />
          </div>
        </form>

        <button onClick={toggle} className="btn-ghost px-2" title="切换主题">
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        {session?.user ? (
          <>
            <Link href="/post/new" className="btn-primary">
              <Plus className="h-4 w-4" /> <span className="hidden sm:inline">发布</span>
            </Link>
            <Link href="/notifications" className="btn-ghost relative px-2">
              <Bell className="h-4 w-4" />
              {unread > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] text-white">
                  {unread > 99 ? "99+" : unread}
                </span>
              )}
            </Link>
            <div className="relative">
              <button onClick={() => setMenuOpen((v) => !v)} className="btn-ghost px-1">
                {session.user.image || (session.user as any).avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={(session.user as any).avatar || session.user.image!} alt="" className="h-7 w-7 rounded-full" />
                ) : (
                  <div className="grid h-7 w-7 place-items-center rounded-full bg-brand-100 text-brand-700 text-xs font-semibold">
                    {(session.user.name || "U").slice(0, 1)}
                  </div>
                )}
              </button>
              {menuOpen && (
                <div onMouseLeave={() => setMenuOpen(false)} className="absolute right-0 mt-2 w-48 card p-1 shadow-lg">
                  <Link href={`/u/${(session.user as any).username}`} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-[rgb(var(--hover))]">
                    <UserIcon className="h-4 w-4" /> 个人主页
                  </Link>
                  <Link href="/settings" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-[rgb(var(--hover))]">
                    设置
                  </Link>
                  {(session.user as any).role === "admin" && (
                    <Link href="/admin" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-[rgb(var(--hover))]">
                      <Shield className="h-4 w-4" /> 管理后台
                    </Link>
                  )}
                  <button onClick={() => signOut()} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-[rgb(var(--hover))] text-left">
                    <LogOut className="h-4 w-4" /> 退出
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Link href="/login" className="btn-ghost">登录</Link>
            <Link href="/register" className="btn-primary">注册</Link>
          </>
        )}
      </div>
    </header>
  );
}

