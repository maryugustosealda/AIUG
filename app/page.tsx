import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getFeed } from "@/lib/feed";
import PostCard from "@/components/post/post-card";
import BannerHero from "@/components/banner-hero";
import { TrendingUp, Clock, Hash } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: { sort?: string };
}) {
  const sort = (searchParams.sort === "hot" ? "hot" : "latest") as "latest" | "hot";
  const [posts, hotCircles, hotTags, userCount, appCount, circleCount, roomCount] = await Promise.all([
    getFeed({ sort, take: 20 }),
    prisma.circle.findMany({ orderBy: { postCount: "desc" }, take: 6 }),
    prisma.post.findMany({
      where: { status: "published", tags: { not: null } },
      select: { tags: true },
      take: 200,
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count(),
    prisma.app.count(),
    prisma.circle.count(),
    prisma.chatRoom.count(),
  ]);

  const tagCount: Record<string, number> = {};
  for (const p of hotTags) {
    try {
      (JSON.parse(p.tags || "[]") as string[]).forEach(
        (t) => (tagCount[t] = (tagCount[t] || 0) + 1)
      );
    } catch {}
  }
  const topTags = Object.entries(tagCount).sort((a, b) => b[1] - a[1]).slice(0, 12);

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_280px]">
      <div>
        <BannerHero
          stats={{ users: userCount, apps: appCount, circles: circleCount, rooms: roomCount }}
        />

        <div className="mb-4 flex items-center gap-2">
          <Link href="/?sort=latest" className={`btn-ghost ${sort === "latest" ? "bg-[rgb(var(--hover))]" : ""}`}>
            <Clock className="h-4 w-4" /> 最新
          </Link>
          <Link href="/?sort=hot" className={`btn-ghost ${sort === "hot" ? "bg-[rgb(var(--hover))]" : ""}`}>
            <TrendingUp className="h-4 w-4" /> 热门
          </Link>
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
                <Link href={`/circles/${c.slug}`} className="flex items-center justify-between hover:text-brand-600">
                  <span>{c.name}</span>
                  <span className="text-xs text-[rgb(var(--muted))]">{c.postCount} 帖</span>
                </Link>
              </li>
            ))}
            {hotCircles.length === 0 && <li className="text-[rgb(var(--muted))] text-xs">暂无</li>}
          </ul>
          <Link href="/circles" className="mt-3 inline-block text-xs link">查看全部 →</Link>
        </div>

        <div className="card p-4">
          <h3 className="mb-3 flex items-center gap-1 font-semibold">
            <Hash className="h-4 w-4" /> 热门标签
          </h3>
          <div className="flex flex-wrap gap-2">
            {topTags.map(([t, n]) => (
              <Link key={t} href={`/search?tag=${encodeURIComponent(t)}`} className="chip hover:bg-brand-100 dark:hover:bg-brand-900/40">
                {t} <span className="ml-1 text-[rgb(var(--muted))]">{n}</span>
              </Link>
            ))}
            {topTags.length === 0 && <span className="text-[rgb(var(--muted))] text-xs">暂无</span>}
          </div>
        </div>

        <div className="card p-4 text-xs text-[rgb(var(--muted))]">
          <p className="mb-1 font-medium text-[rgb(var(--fg))]">关于 AIUG</p>
          <p>AI 创作者聚集地。下载链接由创作者提供,平台仅作信息聚合与审核。</p>
        </div>
      </aside>
    </div>
  );
}

