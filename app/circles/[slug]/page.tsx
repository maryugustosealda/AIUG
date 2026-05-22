import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getFeed } from "@/lib/feed";
import PostCard from "@/components/post/post-card";
import BadgeIcon from "@/components/badge-icon";
import { COLORS, parseBadge } from "@/lib/badge";

export const dynamic = "force-dynamic";

export default async function CirclePage({ params }: { params: { slug: string } }) {
  const circle = await prisma.circle.findUnique({ where: { slug: params.slug } });
  if (!circle) return notFound();
  const posts = await getFeed({ circleId: circle.id, take: 30 });
  const { colorKey } = parseBadge(circle.icon, circle.slug);
  const tone = COLORS[colorKey];
  return (
    <div className="space-y-5">
      <div className="card overflow-hidden">
        <div className={`h-32 bg-gradient-to-br ${tone.from} ${tone.to}`} />
        <div className="p-5">
          <div className="flex items-end gap-3">
            <div className="-mt-12">
              <BadgeIcon raw={circle.icon} seed={circle.slug} size="xl" className="ring-4 ring-[rgb(var(--card))] shadow" />
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold">{circle.name}</h1>
              <p className="text-sm text-[rgb(var(--muted))]">{circle.description}</p>
            </div>
            <div className="text-right text-xs text-[rgb(var(--muted))]">
              <div>{circle.postCount} 帖</div>
              <div>{circle.memberCount} 成员</div>
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-4">
        {posts.length === 0 && <div className="card p-12 text-center text-[rgb(var(--muted))]">这个圈子还没有内容</div>}
        {posts.map((p) => <PostCard key={p.id} post={p as any} />)}
      </div>
    </div>
  );
}

