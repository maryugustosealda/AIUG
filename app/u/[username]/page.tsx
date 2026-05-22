import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getFeed } from "@/lib/feed";
import PostCard from "@/components/post/post-card";
import FollowButton from "@/components/user/follow-button";

export const dynamic = "force-dynamic";

export default async function UserPage({ params }: { params: { username: string } }) {
  const user = await prisma.user.findUnique({
    where: { username: params.username },
    select: {
      id: true, username: true, nickname: true, avatar: true, bio: true, createdAt: true,
      _count: { select: { posts: true, followedBy: true, follows: true } },
    },
  });
  if (!user) return notFound();
  const posts = await getFeed({ authorId: user.id, take: 30 });
  const session = await auth();
  const isFollowing = session?.user && session.user.id !== user.id
    ? !!(await prisma.follow.findUnique({ where: { followerId_followingId: { followerId: session.user.id, followingId: user.id } } }))
    : false;

  return (
    <div className="space-y-5">
      <div className="card p-6">
        <div className="flex flex-wrap items-center gap-4">
          {user.avatar ? <img src={user.avatar} alt="" className="h-20 w-20 rounded-full" /> : (
            <div className="grid h-20 w-20 place-items-center rounded-full bg-brand-100 text-brand-700 text-2xl font-bold">{user.nickname.slice(0, 1)}</div>
          )}
          <div className="flex-1">
            <h1 className="text-xl font-bold">{user.nickname}</h1>
            <div className="text-sm text-[rgb(var(--muted))]">@{user.username}</div>
            {user.bio && <p className="mt-2 text-sm">{user.bio}</p>}
            <div className="mt-2 flex gap-4 text-sm text-[rgb(var(--muted))]">
              <span><b className="text-[rgb(var(--fg))]">{user._count.posts}</b> 帖</span>
              <span><b className="text-[rgb(var(--fg))]">{user._count.followedBy}</b> 粉丝</span>
              <span><b className="text-[rgb(var(--fg))]">{user._count.follows}</b> 关注</span>
            </div>
          </div>
          {session?.user && session.user.id !== user.id && (
            <FollowButton userId={user.id} initial={isFollowing} />
          )}
          {session?.user?.id === user.id && (
            <Link href="/settings" className="btn-outline">编辑资料</Link>
          )}
        </div>
      </div>
      <div className="space-y-4">
        {posts.length === 0 && <div className="card p-12 text-center text-[rgb(var(--muted))]">还没有发布内容</div>}
        {posts.map((p) => <PostCard key={p.id} post={p as any} />)}
      </div>
    </div>
  );
}

