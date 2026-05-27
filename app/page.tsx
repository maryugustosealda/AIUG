import Link from "next/link";
import { prisma } from "@/lib/prisma";
import BannerHero from "@/components/banner-hero";
import { ArrowRight, Download, Star, Eye } from "lucide-react";
import { formatPrice, pricingLabel, safeJSON } from "@/lib/utils";

export const revalidate = 60;

export default async function HomePage() {
  const [topApps, allApps, userCount, appCount] = await Promise.all([
    prisma.app.findMany({
      orderBy: { downloadCount: "desc" },
      take: 10,
      include: {
        category: true,
        post: { select: { id: true, title: true, likeCount: true, viewCount: true, commentCount: true, author: { select: { nickname: true, avatar: true } } } },
      },
    }),
    prisma.app.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: {
        category: true,
        post: { select: { id: true, title: true, content: true, likeCount: true, viewCount: true, commentCount: true, author: { select: { nickname: true, avatar: true } } } },
      },
    }),
    prisma.user.count(),
    prisma.app.count(),
  ]);

  return (
    <div className="space-y-8">
      <BannerHero stats={{ users: userCount, apps: appCount, circles: 0, rooms: 0 }} />

      {/* 下载榜单 TOP 10 */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Download className="h-5 w-5 text-[rgb(var(--accent))]" /> 下载榜单
          </h2>
          <Link href="/apps" className="text-sm link flex items-center gap-1">
            全部应用 <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="card-tech overflow-hidden">
          <div className="divide-y divide-[rgb(var(--border))]/50">
            {topApps.map((a, idx) => (
              <Link key={a.id} href={`/apps/${a.id}`} className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-[rgb(var(--hover))]/60 group">
                <span className={`w-6 text-center text-sm font-bold tabular-nums ${idx < 3 ? "text-amber-500" : "text-[rgb(var(--muted))]"}`}>
                  {idx + 1}
                </span>
                {a.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={a.logo} alt="" className="h-10 w-10 shrink-0 rounded-xl object-cover ring-1 ring-[rgb(var(--border))]/50" />
                ) : (
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-500/20 to-violet-500/20 text-brand-400 font-bold">
                    {a.name.slice(0, 1)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-semibold group-hover:text-[rgb(var(--accent))] transition-colors">{a.name}</h3>
                  <p className="truncate text-xs text-[rgb(var(--muted))]">{a.summary}</p>
                </div>
                <span className="chip text-[10px] px-1.5 py-0.5 shrink-0">{a.category.name}</span>
                <span className={`text-xs font-medium shrink-0 ${a.pricingMode === "paid" ? "text-amber-500" : "text-emerald-500"}`}>
                  {a.pricingMode === "paid" ? formatPrice(a.price) : pricingLabel(a.pricingMode)}
                </span>
                <span className="text-xs text-[rgb(var(--muted))] shrink-0 tabular-nums">{a.downloadCount} 下载</span>
              </Link>
            ))}
            {topApps.length === 0 && (
              <div className="p-10 text-center text-[rgb(var(--muted))]">
                还没有应用，<Link href="/post/new?type=app" className="link">发布第一个</Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Steam 风格应用展示 */}
      <section>
        <h2 className="mb-4 text-lg font-bold">最新上架</h2>
        <div className="space-y-4">
          {allApps.map((a) => {
            const screenshots = safeJSON<string[]>(a.screenshots, []);
            const desc = a.post.content.replace(/[#*\n]/g, " ").slice(0, 120);
            return (
              <Link key={a.id} href={`/apps/${a.id}`} className="card-tech group grid gap-4 overflow-hidden p-0 sm:grid-cols-[320px_1fr]">
                {/* 左侧：截图轮播区 */}
                <div className="relative aspect-video sm:aspect-auto sm:h-full overflow-hidden bg-gradient-to-br from-brand-500/10 to-violet-800/10">
                  {screenshots.length > 0 ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={screenshots[0]} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="grid h-full min-h-[140px] place-items-center">
                      <div className="text-4xl font-bold text-gradient opacity-50">{a.name.slice(0, 2)}</div>
                    </div>
                  )}
                  {screenshots.length > 1 && (
                    <div className="absolute bottom-2 left-2 flex gap-1">
                      {screenshots.slice(0, 4).map((_, i) => (
                        <span key={i} className="h-1.5 w-4 rounded-full bg-white/40" />
                      ))}
                    </div>
                  )}
                </div>
                {/* 右侧：信息 */}
                <div className="flex flex-col justify-between p-4 sm:py-5 sm:pr-5 sm:pl-0">
                  <div>
                    <div className="flex items-start gap-3">
                      {a.logo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={a.logo} alt="" className="h-10 w-10 shrink-0 rounded-xl object-cover ring-1 ring-[rgb(var(--border))]/50" />
                      ) : (
                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-500/20 to-violet-500/20 text-brand-400 font-bold">{a.name.slice(0, 1)}</div>
                      )}
                      <div className="min-w-0">
                        <h3 className="text-base font-bold group-hover:text-[rgb(var(--accent))] transition-colors">{a.name}</h3>
                        <p className="text-xs text-[rgb(var(--muted))]">{a.summary}</p>
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-[rgb(var(--muted))] line-clamp-2">{desc}</p>
                  </div>
                  <div className="mt-3 flex items-center gap-3 text-xs text-[rgb(var(--muted))]">
                    <span className="chip">{a.category.name}</span>
                    <span className="flex items-center gap-0.5"><Star className="h-3 w-3 text-amber-400" /> {a.post.likeCount}</span>
                    <span className="flex items-center gap-0.5"><Eye className="h-3 w-3" /> {a.post.viewCount}</span>
                    <span className="flex items-center gap-0.5"><Download className="h-3 w-3" /> {a.downloadCount}</span>
                    <span className={`ml-auto font-semibold text-sm ${a.pricingMode === "paid" ? "text-amber-500" : "text-emerald-500"}`}>
                      {a.pricingMode === "paid" ? formatPrice(a.price) : pricingLabel(a.pricingMode)}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
          {allApps.length === 0 && (
            <div className="card p-12 text-center text-[rgb(var(--muted))]">
              还没有应用，<Link href="/post/new?type=app" className="link">发布第一个</Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}