import Link from "next/link";
import { getFeed } from "@/lib/feed";
import PostCard from "@/components/post/post-card";
import { Users, PenSquare, TrendingUp, Clock } from "lucide-react";

export const revalidate = 60;

export default async function CommunityPage({
  searchParams,
}: {
  searchParams: { sort?: string };
}) {
  const sort = (searchParams.sort === "hot" ? "hot" : "latest") as "latest" | "hot";
  const posts = await getFeed({ sort, take: 20 });

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

      {/* 排序 + 帖子流 */}
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
    </div>
  );
}