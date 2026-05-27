import Link from "next/link";
import { ArrowRight, Sparkles, Download, MessageSquare, Wrench } from "lucide-react";

type Stats = { users: number; apps: number; circles: number; rooms?: number };

export default function BannerHero({ stats }: { stats: Stats }) {
  return (
    <section className="relative mb-8 overflow-hidden rounded-3xl border border-white/10 bg-[#0b0d2a] text-white">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/90 via-violet-800/70 to-fuchsia-900/50" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-60" />
      <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-cyan-400/20 blur-[80px] animate-pulse-glow" />
      <div className="pointer-events-none absolute -right-16 -bottom-20 h-56 w-56 rounded-full bg-fuchsia-500/20 blur-[80px] animate-pulse-glow" style={{ animationDelay: "1.5s" }} />

      <div className="relative px-6 py-10 sm:px-10 sm:py-12 md:py-14">
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl animate-fade-in-up">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/80 backdrop-blur-sm">
              <Sparkles className="h-3 w-3 text-cyan-300" />
              AI 创作者社区
            </div>
            <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-[2.75rem]">
              探索 AI 的<span className="bg-gradient-to-r from-cyan-300 via-blue-300 to-violet-300 bg-clip-text text-transparent"> 无限可能</span>
            </h1>
            <p className="mt-3 text-sm text-white/60 sm:text-base">发布应用、分享技能、交流经验，与创作者一起构建 AI 新世界</p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/post/new?type=app"
                className="group inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-indigo-700 shadow-lg shadow-white/10 transition-all hover:shadow-white/20 hover:scale-[1.02] active:scale-[0.98]"
              >
                发布我的应用
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/circles"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-medium backdrop-blur-sm transition-all hover:bg-white/10 hover:border-white/30"
              >
                逛逛社区
              </Link>
            </div>
          </div>

          {/* 右侧：平台特性 */}
          <div className="hidden md:grid grid-cols-1 gap-2.5 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <FeatureCard icon={<Download className="h-4 w-4 text-cyan-300" />} title="海量应用" desc="精选 AI 工具一键下载" />
            <FeatureCard icon={<MessageSquare className="h-4 w-4 text-violet-300" />} title="活跃社区" desc="交流经验互助成长" />
            <FeatureCard icon={<Wrench className="h-4 w-4 text-amber-300" />} title="技能接单" desc="发布技能获取收益" />
          </div>
        </div>

        {/* 移动端特性标签 */}
        <div className="mt-6 flex items-center gap-3 md:hidden text-xs text-white/70">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1"><Download className="h-3 w-3" /> 海量应用</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1"><MessageSquare className="h-3 w-3" /> 活跃社区</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1"><Wrench className="h-3 w-3" /> 技能接单</span>
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm min-w-[180px]">
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/10">{icon}</div>
      <div>
        <div className="text-sm font-semibold">{title}</div>
        <div className="text-xs text-white/50">{desc}</div>
      </div>
    </div>
  );
}