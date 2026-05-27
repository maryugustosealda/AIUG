import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getFeed } from "@/lib/feed";
import PostCard from "@/components/post/post-card";
import BannerHero from "@/components/banner-hero";
import { TrendingUp, Clock, ArrowRight } from "lucide-react";
import { formatPrice, pricingLabel } from "@/lib/utils";

export const revalidate = 60; // ISR: 每60秒重新生成

export default async function HomePage({
  searchParams,
}: {
  searchParams: { sort?: string };
}) {
  const sort = (searchParams.sort === "hot" ? "hot" : "latest") as "latest" | "hot";
  const [posts, hotApps, userCount, appCount] = await Promise.all([
    getFeed({ sort, take: 10 }),
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
  ]);

  return (
    <div className="space-y-6">
      <BannerHero
        stats={{ users: userCount, apps: appCount, circles: 0, rooms: 0 }}
      />

      {/* 热门应用 */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">热门应用</h2>
          <Link href="/apps" className="text-sm link flex items-center gap-1">
            全部应用 <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {hotApps.map((a) => (
            <Link key={a.id} href={`/apps/${a.id}`} className="card-tech group flex items-center gap-3 p-3.5">
              {a.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={a.logo} alt="" className="h-11 w-11 shrink-0 rounded-xl object-cover ring-1 ring-[rgb(var(--border))]/50" />
              ) : (
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-500/20 to-violet-500/20 text-brand-400 text-base font-bold">
                  {a.name.slice(0, 1)}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-semibold group-hover:text-[rgb(var(--accent))] transition-colors">{a.name}</h3>
                <p className="line-clamp-1 mt-0.5 text-xs text-[rgb(var(--muted))]">{a.summary}</p>
                <div className="mt-1 flex items-center gap-2 text-xs text-[rgb(var(--muted))]">
                  <span className="chip text-[10px] px-1.5 py-0.5">{a.category.name}</span>
                  <span className={`font-medium ${a.pricingMode === "paid" ? "text-amber-500" : "text-emerald-500"}`}>
                    {a.pricingMode === "paid" ? formatPrice(a.price) : pricingLabel(a.pricingMode)}
                  </span>
                </div>
              </div>
            </Link>
          ))}
          {hotApps.length === 0 && (
            <div className="card col-span-full p-10 text-center text-[rgb(var(--muted))]">
              还没有应用，<Link href="/post/new?type=app" className="link">发布第一个</Link>
            </div>
          )}
        </div>
      </section>

      {/* 最新动态 */}
      <section>
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
      </section>
    </div>
  );
}
