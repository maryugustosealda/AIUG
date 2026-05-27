import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getFeed } from "@/lib/feed";
import PostCard from "@/components/post/post-card";
import BannerHero from "@/components/banner-hero";
import BadgeIcon from "@/components/badge-icon";
import { TrendingUp, Clock, Hash, ArrowRight } from "lucide-react";
import { safeJSON, formatPrice, pricingLabel } from "@/lib/utils";

export const revalidate = 60; // ISR: 每60秒重新生成

export default async function HomePage({
  searchParams,
}: {
  searchParams: { sort?: string };
}) {
  const sort = (searchParams.sort === "hot" ? "hot" : "latest") as "latest" | "hot";
  const [posts, hotCircles, hotApps, userCount, appCount, circleCount] = await Promise.all([
    getFeed({ sort, take: 10 }),
    prisma.circle.findMany({ orderBy: { postCount: "desc" }, take: 6 }),
    prisma.app.findMany({
      orderBy: { downloadCount: "desc" },
      take: 6,
      include: {
        category: true,
        post: { select: { id: true, title: true, author: { select: { nickname: true } } } },
      },
    }),
    prisma.user.count(),
    prisma.app.count(),
    prisma.circle.count(),
  ]);

  return (
    <div className="space-y-6">
      <BannerHero
        stats={{ users: userCount, apps: appCount, circles: circleCount, rooms: 0 }}
      />

      {/* 热门应用 */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">热门应用</h2>
          <Link href="/apps" className="text-sm link flex items-center gap-1">
            全部应用 <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {hotApps.map((a) => {
            const screenshots = safeJSON<string[]>(a.screenshots, []);
            const cover = screenshots[0];
            return (
              <Link key={a.id} href={`/apps/${a.id}`} className="card-tech group overflow-hidden">
                <div className="aspect-video overflow-hidden bg-gradient-to-br from-brand-500/10 to-violet-800/10 relative">
                  {cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={cover} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="grid h-full place-items-center">
                      <div className="text-4xl font-bold text-gradient opacity-60">
                        {a.name.slice(0, 1)}
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[rgb(var(--card))]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    {a.logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={a.logo} alt="" className="h-10 w-10 shrink-0 rounded-xl object-cover ring-1 ring-[rgb(var(--border))]/50" />
                    ) : (
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-500/20 to-violet-500/20 text-brand-400 text-sm font-bold">{a.name.slice(0, 1)}</div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-semibold text-sm group-hover:text-[rgb(var(--accent))] transition-colors">{a.name}</h3>
                      <p className="line-clamp-1 mt-0.5 text-xs text-[rgb(var(--muted))]">{a.summary}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-[rgb(var(--muted))]">
                    <span className="chip">{a.category.name}</span>
                    <span className={`font-semibold ${a.pricingMode === "paid" ? "text-amber-500" : "text-emerald-500"}`}>
                      {a.pricingMode === "paid" ? formatPrice(a.price) : pricingLabel(a.pricingMode)}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
          {hotApps.length === 0 && (
            <div className="card col-span-full p-12 text-center text-[rgb(var(--muted))]">
              还没有应用，<Link href="/post/new?type=app" className="link">发布第一个</Link>
            </div>
          )}
        </div>
      </section>

      {/* 最新动态 */}
      <section className="grid gap-6 md:grid-cols-[1fr_280px]">
        <div>
          <div className="mb-4 flex items-center gap-2">
            <h2 className="text-lg font-bold">最新动态</h2>
            <div className="ml-4 flex items-center gap-2">
              <Link href="/?sort=latest" className={`btn-ghost text-sm ${sort === "latest" ? "bg-[rgb(var(--hover))]" : ""}`}>
                <Clock className="h-4 w-4" /> 最新
              </Link>
              <Link href="/?sort=hot" className={`btn-ghost text-sm ${sort === "hot" ? "bg-[rgb(var(--hover))]" : ""}`}>
                <TrendingUp className="h-4 w-4" /> 热门
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            {posts.length === 0 ? (
              <div className="card p-12 text-center text-[rgb(var(--muted))]">
                还没有人发布内容,
                <Link href="/post/new" className="link">来当第一个</Link> 吧
              </div>
            ) : (
              posts.map((p) => <PostCard key={p.id} post={p as any} />)
            )}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="card p-4">
            <h3 className="mb-3 font-semibold">热门圈子</h3>
            <ul className="space-y-2 text-sm">
              {hotCircles.map((c) => (
                <li key={c.id}>
                  <Link href={`/circles/${c.slug}`} className="flex items-center gap-2 hover:text-brand-600">
                    <BadgeIcon raw={c.icon} seed={c.slug} size="xs" />
                    <span className="flex-1 truncate">{c.name}</span>
                    <span className="text-xs text-[rgb(var(--muted))]">{c.postCount}</span>
                  </Link>
                </li>
              ))}
              {hotCircles.length === 0 && <li className="text-[rgb(var(--muted))] text-xs">暂无</li>}
            </ul>
            <Link href="/circles" className="mt-3 inline-block text-xs link">查看全部 →</Link>
          </div>

          <div className="card p-4 text-xs text-[rgb(var(--muted))]">
            <p className="mb-1 font-medium text-[rgb(var(--fg))]">关于 AIUG</p>
            <p>AI 创作者聚集地。下载链接由创作者提供,平台仅作信息聚合与审核。</p>
          </div>
        </aside>
      </section>
    </div>
  );
}

