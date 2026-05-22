import Link from "next/link";
import { ArrowRight } from "lucide-react";

type Stats = { users: number; apps: number; circles: number; rooms: number };

export default function BannerHero({ stats }: { stats: Stats }) {
  return (
    <section className="relative mb-6 overflow-hidden rounded-2xl border border-white/10 bg-[#0b0d2a] p-8 text-white">
      {/* 渐变 */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-700/85 via-violet-700/65 to-fuchsia-700/40" />
      {/* 柔光斑 */}
      <div className="pointer-events-none absolute -left-20 -top-20 h-56 w-56 rounded-full bg-cyan-400/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 -bottom-16 h-56 w-56 rounded-full bg-fuchsia-500/30 blur-3xl" />
      {/* 点阵 */}
      <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.18]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="dotpat" x="0" y="0" width="22" height="22" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="white" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dotpat)" />
      </svg>
      {/* 右上节点连线装饰 */}
      <svg className="pointer-events-none absolute right-4 top-2 h-32 w-32 opacity-30" viewBox="0 0 160 160" fill="none">
        <circle cx="20" cy="20" r="3" fill="#fff" />
        <circle cx="140" cy="40" r="3" fill="#fff" />
        <circle cx="80" cy="100" r="3" fill="#fff" />
        <circle cx="30" cy="140" r="3" fill="#fff" />
        <circle cx="130" cy="130" r="3" fill="#fff" />
        <line x1="20" y1="20" x2="80" y2="100" stroke="#fff" strokeWidth="0.6" />
        <line x1="140" y1="40" x2="80" y2="100" stroke="#fff" strokeWidth="0.6" />
        <line x1="80" y1="100" x2="30" y2="140" stroke="#fff" strokeWidth="0.6" />
        <line x1="80" y1="100" x2="130" y2="130" stroke="#fff" strokeWidth="0.6" />
      </svg>

      <div className="relative flex flex-col gap-5">
        <h1 className="text-3xl font-bold leading-tight tracking-tight md:text-4xl">
          AI 创作者聚集地
        </h1>

        <div className="flex flex-wrap items-center gap-3">
          <Link href="/post/new?type=app" className="inline-flex items-center gap-1 rounded-lg bg-white px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-white/90">
            发布我的应用 <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/apps" className="inline-flex items-center gap-1 rounded-lg border border-white/30 bg-white/5 px-4 py-2 text-sm font-medium hover:bg-white/15">
            逛逛应用市集
          </Link>
          <div className="ml-auto hidden items-center gap-4 text-xs text-white/85 sm:flex">
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