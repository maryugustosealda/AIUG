import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function CreatorsPage() {
  const users = await prisma.user.findMany({
    take: 60,
    orderBy: { createdAt: "desc" },
    select: {
      id: true, username: true, nickname: true, avatar: true, bio: true,
      _count: { select: { posts: true, followedBy: true } },
    },
  });
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">创作者</h1>
        <p className="text-sm text-[rgb(var(--muted))]">发现优秀的 AI 应用作者与分享者</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {users.map((u) => (
          <Link key={u.id} href={`/u/${u.username}`} className="card p-4 transition hover:border-brand-300 dark:hover:border-brand-700">
            <div className="flex items-center gap-3">
              {u.avatar ? <img src={u.avatar} alt="" className="h-12 w-12 rounded-full" /> : (
                <div className="grid h-12 w-12 place-items-center rounded-full bg-brand-100 text-brand-700 font-semibold">{u.nickname.slice(0, 1)}</div>
              )}
              <div className="min-w-0 flex-1">
                <div className="truncate font-semibold">{u.nickname}</div>
                <div className="truncate text-xs text-[rgb(var(--muted))]">@{u.username}</div>
              </div>
            </div>
            {u.bio && <p className="mt-2 line-clamp-2 text-sm text-[rgb(var(--muted))]">{u.bio}</p>}
            <div className="mt-3 flex gap-3 text-xs text-[rgb(var(--muted))]">
              <span>{u._count.posts} 帖</span>
              <span>{u._count.followedBy} 粉丝</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

