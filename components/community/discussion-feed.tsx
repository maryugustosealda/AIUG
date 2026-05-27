import Link from "next/link";
import { getFeed } from "@/lib/feed";
import PostCard from "@/components/post/post-card";
import { MessageSquarePlus, Flame, Clock } from "lucide-react";

export async function DiscussionFeed({ sort }: { sort: "latest" | "hot" }) {
  const posts = await getFeed({ sort, take: 40, discussionOnly: true });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Link
          href="/circles?sort=latest"
          className={`btn-ghost text-sm ${sort === "latest" ? "chip-active !text-brand-300" : ""}`}
        >
          <Clock className="h-4 w-4" /> 最新讨论
        </Link>
        <Link
          href="/circles?sort=hot"
          className={`btn-ghost text-sm ${sort === "hot" ? "chip-active !text-brand-300" : ""}`}
        >
          <Flame className="h-4 w-4" /> 热门
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="card-tech p-12 text-center">
          <MessageSquarePlus className="mx-auto h-10 w-10 text-[rgb(var(--muted))]" />
          <p className="mt-4 text-[rgb(var(--muted))]">还没有讨论，来发第一条吧</p>
          <Link href="/post/new" className="btn-primary mt-4 inline-flex">
            发起讨论
          </Link>
        </div>
      ) : (
        posts.map((p) => <PostCard key={p.id} post={p as any} variant="discussion" />)
      )}
    </div>
  );
}