import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import Markdown from "@/components/markdown";
import CommentSection from "@/components/post/comment-section";
import LikeButton from "@/components/post/like-button";
import FavoriteButton from "@/components/post/favorite-button";
import FollowButton from "@/components/user/follow-button";
import { fromNow, safeJSON } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function PostPage({ params }: { params: { id: string } }) {
  const post = await prisma.post.findUnique({
    where: { id: params.id },
    include: {
      author: { select: { id: true, username: true, nickname: true, avatar: true, bio: true } },
      circle: { select: { slug: true, name: true } },
      app: true,
    },
  });
  if (!post) return notFound();
  if (post.type === "app") redirect(`/apps/${post.id}`);

  const session = await auth();
  if (post.status !== "published" && post.authorId !== session?.user?.id && (session?.user as any)?.role !== "admin") {
    return notFound();
  }

  prisma.post.update({ where: { id: post.id }, data: { viewCount: { increment: 1 } } }).catch(() => {});

  const liked = session?.user
    ? !!(await prisma.like.findUnique({ where: { userId_postId: { userId: session.user.id, postId: post.id } } }))
    : false;
  const favorited = session?.user
    ? !!(await prisma.favorite.findUnique({ where: { userId_postId: { userId: session.user.id, postId: post.id } } }))
    : false;
  const isFollowing = session?.user && session.user.id !== post.authorId
    ? !!(await prisma.follow.findUnique({ where: { followerId_followingId: { followerId: session.user.id, followingId: post.authorId } } }))
    : false;

  const tags = safeJSON<string[]>(post.tags, []);

  return (
    <article className="mx-auto max-w-3xl space-y-4">
      <div className="card p-6">
        <div className="mb-4 flex items-center gap-3">
          <Link href={`/u/${post.author.username}`}>
            {post.author.avatar ? (
              <img src={post.author.avatar} alt="" className="h-10 w-10 rounded-full" />
            ) : (
              <div className="grid h-10 w-10 place-items-center rounded-full bg-brand-100 text-brand-700 font-semibold">
                {post.author.nickname.slice(0, 1)}
              </div>
            )}
          </Link>
          <div className="flex-1">
            <Link href={`/u/${post.author.username}`} className="font-medium hover:text-brand-600">{post.author.nickname}</Link>
            <div className="text-xs text-[rgb(var(--muted))]">
              {fromNow(post.createdAt)}
              {post.circle && <> · 来自 <Link href={`/circles/${post.circle.slug}`} className="link">{post.circle.name}</Link></>}
            </div>
          </div>
          {session?.user && session.user.id !== post.authorId && (
            <FollowButton userId={post.authorId} initial={isFollowing} />
          )}
        </div>

        <h1 className="text-2xl font-bold leading-tight">{post.title}</h1>
        {tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {tags.map((t) => (
              <Link key={t} href={`/search?tag=${encodeURIComponent(t)}`} className="chip hover:bg-brand-100 dark:hover:bg-brand-900/40">#{t}</Link>
            ))}
          </div>
        )}
        {post.cover && <img src={post.cover} alt="" className="mt-5 w-full rounded-lg" />}

        <div className="mt-5">
          <Markdown content={post.content} />
        </div>

        <div className="mt-6 flex items-center gap-4 border-t border-[rgb(var(--border))] pt-4 text-sm text-[rgb(var(--muted))]">
          <LikeButton postId={post.id} initial={post.likeCount} liked={liked} size="md" />
          <FavoriteButton postId={post.id} initial={favorited} size="md" />
          <span>· {post.viewCount} 次阅读</span>
        </div>
      </div>

      <CommentSection postId={post.id} />
    </article>
  );
}

