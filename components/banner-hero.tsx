import Link from "next/link";
import { ArrowRight } from "lucide-react";

type Stats = { users: number; apps: number; circles: number; rooms: number };

export default function BannerHero({ stats }: { stats: Stats }) {
  return (
    <section className="relative mb-6 overflow-hidden rounded-2xl border border-white/10 bg-[#0b0d2a] px-6 py-6 text-white sm:px-8">
      {/* 渐变底 */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-700/85 via-violet-700/60 to-fuchsia-700/35" />
      {/* 柔光斑 */}
      <div className="pointer-events-none absolute -left-16 -top-16 h-44 w-44 rounded-full bg-cyan-400/25 blur-3xl" />
      <div className="pointer-events-none absolute -right-12 -bottom-16 h-44 w-44 rounded-full bg-fuchsia-500/25 blur-3xl" />
      {/* 右侧节点装饰(呼应 Logo 三节点) */}
      <svg
        className="pointer-events-none absolute right-2 top-1/2 hidden h-28 w-28 -translate-y-1/2 opacity-25 sm:block"
        viewBox="0 0 160 160"
        fill="none"
      >
        <circle cx="20" cy="20" r="2.5" fill="#fff" />
        <circle cx="140" cy="40" r="2.5" fill="#fff" />
        <circle cx="80" cy="100" r="2.5" fill="#fff" />
        <circle cx="30" cy="140" r="2.5" fill="#fff" />
        <circle cx="130" cy="130" r="2.5" fill="#fff" />
        <line x1="20" y1="20" x2="80" y2="100" stroke="#fff" strokeWidth="0.6" />
        <line x1="140" y1="40" x2="80" y2="100" stroke="#fff" strokeWidth="0.6" />
        <line x1="80" y1="100" x2="30" y2="140" stroke="#fff" strokeWidth="0.6" />
        <line x1="80" y1="100" x2="130" y2="130" stroke="#fff" strokeWidth="0.6" />
      </svg>

      <div className="relative flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-bold leading-tight tracking-tight md:text-3xl">
            AI 创作者聚集地
          </h1>
          <p className="mt-1 text-sm text-white/70">
            发布作品、加入圈子、与志同道合的人一起折腾
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/post/new?type=app"
            className="inline-flex items-center gap-1 rounded-lg bg-white px-3.5 py-1.5 text-sm font-medium text-indigo-700 hover:bg-white/90"
          >
            发布我的应用 <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/apps"
            className="inline-flex items-center gap-1 rounded-lg border border-white/30 bg-white/5 px-3.5 py-1.5 text-sm font-medium hover:bg-white/15"
          >
            逛逛应用市集
          </Link>
          <div className="ml-auto hidden items-center gap-3 text-xs text-white/80 md:flex">
            <Stat n={stats.apps} label="应用" />
            <span className="h-3 w-px bg-white/20" />
            <Stat n={stats.users} label="创作者" />
            <span className="h-3 w-px bg-white/20" />
            <Stat n={stats.circles} label="圈子" />
            <span className="h-3 w-px bg-white/20" />
            <Stat n={stats.rooms} label="群组" />
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ n, label }: { n: number; label: string }) {
  return (
    <span className="inline-flex items-baseline gap-1">
      <span className="text-base font-bold tabular-nums">{n}</span>
      <span className="text-white/65">{label}</span>
    </span>
  );
}