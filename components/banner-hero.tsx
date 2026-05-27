import Link from "next/link";
import { ArrowRight, Sparkles, Zap, Globe } from "lucide-react";

type Stats = { users: number; apps: number; circles: number; rooms?: number };

export default function BannerHero({ stats }: { stats: Stats }) {
  return (
    <section className="relative mb-8 overflow-hidden rounded-3xl border border-white/10 bg-[#0b0d2a] text-white">
      {/* 多层渐变背景 */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/90 via-violet-800/70 to-fuchsia-900/50" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-60" />

      {/* 动态光斑 */}
      <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-cyan-400/20 blur-[80px] animate-pulse-glow" />
      <div className="pointer-events-none absolute -right-16 -bottom-20 h-56 w-56 rounded-full bg-fuchsia-500/20 blur-[80px] animate-pulse-glow" style={{ animationDelay: "1.5s" }} />
      <div className="pointer-events-none absolute left-1/2 top-0 h-40 w-40 rounded-full bg-indigo-400/15 blur-[60px] animate-pulse-glow" style={{ animationDelay: "0.8s" }} />

      {/* 装饰粒子 */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-8 left-[15%] h-1 w-1 rounded-full bg-cyan-300/60 animate-float" />
        <div className="absolute top-16 right-[20%] h-1.5 w-1.5 rounded-full bg-violet-300/50 animate-float" style={{ animationDelay: "1s" }} />
        <div className="absolute bottom-12 left-[30%] h-1 w-1 rounded-full bg-fuchsia-300/50 animate-float" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/2 right-[10%] h-1 w-1 rounded-full bg-white/40 animate-float" style={{ animationDelay: "0.5s" }} />
      </div>

      {/* 内容 */}
      <div className="relative px-6 py-10 sm:px-10 sm:py-14 md:py-16">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-lg animate-fade-in-up">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/80 backdrop-blur-sm">
              <Sparkles className="h-3 w-3 text-cyan-300" />
              AI 创作者社区
            </div>
            <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl">
              探索 AI 的
              <span className="bg-gradient-to-r from-cyan-300 via-blue-300 to-violet-300 bg-clip-text text-transparent"> 无限可能</span>
            </h1>
            <p className="mt-3 text-base text-white/65 leading-relaxed sm:text-lg">
              发布应用、分享技能、加入圈子，与志同道合的创作者一起构建 AI 新世界
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/post/new?type=app"
                className="group inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-indigo-700 shadow-lg shadow-white/10 transition-all hover:shadow-white/20 hover:scale-[1.02] active:scale-[0.98]"
              >
                发布我的应用
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/apps"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-medium backdrop-blur-sm transition-all hover:bg-white/10 hover:border-white/30"
              >
                逛逛应用市集
              </Link>
            </div>
          </div>

          {/* 右侧统计卡片 */}
          <div className="hidden md:flex flex-col gap-3 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <StatCard icon={<Zap className="h-4 w-4 text-amber-300" />} value={stats.apps} label="AI 应用" />
            <StatCard icon={<Globe className="h-4 w-4 text-cyan-300" />} value={stats.users} label="创作者" />
            <StatCard icon={<Sparkles className="h-4 w-4 text-violet-300" />} value={stats.circles} label="活跃圈子" />
          </div>
        </div>

        {/* 移动端统计 */}
        <div className="mt-6 flex items-center gap-4 md:hidden">
          <MobileStat n={stats.apps} label="应用" />
          <span className="h-4 w-px bg-white/20" />
          <MobileStat n={stats.users} label="创作者" />
          <span className="h-4 w-px bg-white/20" />
          <MobileStat n={stats.circles} label="圈子" />
        </div>
      </div>
    </section>
  );
}

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
      <div className="grid h-8 w-8 place-items-center rounded-lg bg-white/10">
        {icon}
      </div>
      <div>
        <div className="text-xl font-bold tabular-nums">{value}</div>
        <div className="text-xs text-white/60">{label}</div>
      </div>
    </div>
  );
}

function MobileStat({ n, label }: { n: number; label: string }) {
  return (
    <span className="inline-flex items-baseline gap-1">
      <span className="text-lg font-bold tabular-nums">{n}</span>
      <span className="text-xs text-white/60">{label}</span>
    </span>
  );
}