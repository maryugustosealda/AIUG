import Link from "next/link";
import { getFeed } from "@/lib/feed";
import PostCard from "@/components/post/post-card";

export const dynamic = "force-dynamic";

export default async function SearchPage({ searchParams }: { searchParams: { q?: string; tag?: string; type?: string } }) {
  const posts = await getFeed({ q: searchParams.q, tag: searchParams.tag, type: searchParams.type, take: 40 });
  const term = searchParams.tag ? `#${searchParams.tag}` : searchParams.q || "";
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">搜索结果</h1>
        {term && <p className="text-sm text-[rgb(var(--muted))]">关键词:{term}</p>}
      </div>
      <div className="space-y-4">
        {posts.length === 0 && <div className="card p-12 text-center text-[rgb(var(--muted))]">没有匹配的内容</div>}
        {posts.map((p) => <PostCard key={p.id} post={p as any} />)}
      </div>
    </div>
  );
}

