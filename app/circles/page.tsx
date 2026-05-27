import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getFeed } from "@/lib/feed";
import BadgeIcon from "@/components/badge-icon";
import PostCard from "@/components/post/post-card";
import { COLORS, parseBadge } from "@/lib/badge";
import { Users, PenSquare, TrendingUp, Clock } from "lucide-react";

export const revalidate = 60;

export default async function CirclesPage({
  searchParams,
}: {
  searchParams: { sort?: string };
}) {
  const sort = (searchParams.sort === "hot" ? "hot" : "latest") as "latest" | "hot";
  const [circles, posts] = await Promise.all([
    prisma.circle.findMany({ orderBy: [{ postCount: "desc" }, { name: "asc" }] }),
    getFeed({ sort, discussionOnly: true, take: 15 }),
  ]);

  return (
    <div className="space-y-6">
      {/* 顶部：社区介绍 + 发帖入口 */}
      <div className="card-tech p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20">
                <Users className="h-5 w-5 text-[rgb(var(--accent))]" />
              </div>
              <div>
                <h1 className="text-xl font-bold">社区</h1>
                <p className="text-xs text-[rgb(var(--muted))]">
                  发帖交流、分享经验、提问求助
                </p>
              </div>
            </div>
          </div>
          <Link href="/post/new?type=text" className="btn-primary">
            <PenSquare className="h-4 w-4" /> 发帖
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_280px]">
        {/* 左侧：帖子流 */}
        <div>
          <div className="mb-4 flex items-center gap-2">
            <Link href="/circles?sort=latest" className={`btn-ghost text-sm ${sort === "latest" ? "bg-[rgb(var(--hover))]" : ""}`}>
              <Clock className="h-4 w-4" /> 最新
            </Link>
            <Link href="/circles?sort=hot" className={`btn-ghost text-sm ${sort === "hot" ? "bg-[rgb(var(--hover))]" : ""}`}>
              <TrendingUp className="h-4 w-4" /> 热门
            </Link>
          </div>

          <div className="space-y-4">
            {posts.length === 0 ? (
              <div className="card p-12 text-center text-[rgb(var(--muted))]">
                还没有人发帖，
                <Link href="/post/new?type=text" className="link">来当第一个</Link>
              </div>
            ) : (
              posts.map((p) => <PostCard key={p.id} post={p as any} variant="discussion" />)
            )}
          </div>
        </div>

        {/* 右侧：圈子列表 */}
        <aside className="space-y-4">
          <div className="card p-4">
            <h3 className="mb-3 font-semibold">加入圈子</h3>
            <ul className="space-y-3">
              {circles.slice(0, 8).map((c) => (
                <li key={c.id}>
                  <Link href={`/circles/${c.slug}`} className="flex items-center gap-2 hover:text-brand-600">
                    <BadgeIcon raw={c.icon} seed={c.slug} size="xs" />
                    <div className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{c.name}</span>
                      <span className="text-xs text-[rgb(var(--muted))]">{c.postCount} 帖 · {c.memberCount} 成员</span>
                    </div>
                  </Link>
                </li>
              ))}
              {circles.length === 0 && <li className="text-[rgb(var(--muted))] text-xs">暂无圈子</li>}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

