import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import Markdown from "@/components/markdown";
import CommentSection from "@/components/post/comment-section";
import LikeButton from "@/components/post/like-button";
import FavoriteButton from "@/components/post/favorite-button";
import FollowButton from "@/components/user/follow-button";
import UnlockBox from "@/components/app/unlock-box";
import Screenshots from "@/components/app/screenshots";
import { fromNow, safeJSON, formatPrice } from "@/lib/utils";
import { Download, Tag, Cpu, Calendar, HardDrive } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AppPage({ params }: { params: { id: string } }) {
  // 这里 params.id 既支持 post.id 也支持 app.id,先按 post.id 试
  let post = await prisma.post.findFirst({
    where: { id: params.id, type: "app" },
    include: {
      author: { select: { id: true, username: true, nickname: true, avatar: true } },
      circle: { select: { slug: true, name: true } },
      app: { include: { category: true } },
    },
  });
  if (!post) {
    const app = await prisma.app.findUnique({
      where: { id: params.id },
      include: {
        post: {
          include: {
            author: { select: { id: true, username: true, nickname: true, avatar: true } },
            circle: { select: { slug: true, name: true } },
          },
        },
        category: true,
      },
    });
    if (!app) return notFound();
    post = { ...app.post, app: { ...app, category: app.category } } as any;
  }
  if (!post || !post.app) return notFound();

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
  const unlocked = session?.user
    ? !!(await prisma.unlock.findUnique({ where: { userId_appId: { userId: session.user.id, appId: post.app.id } } }))
    : false;

  const platforms = safeJSON<string[]>(post.app.platforms, []);
  const tags = safeJSON<string[]>(post.tags, []);
  const screenshots = safeJSON<string[]>(post.app.screenshots, []);
  const a = post.app;

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      {/* 标题区 */}
      <div className="flex items-center gap-4">
        {a.logo ? (
          <img src={a.logo} alt="" className="h-16 w-16 rounded-2xl object-cover shadow" />
        ) : (
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-700 text-2xl font-bold text-white shadow">
            {a.name.slice(0, 1)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold truncate">{a.name}</h1>
          <p className="text-[rgb(var(--muted))] truncate">{a.summary}</p>
        </div>
      </div>

      {/* Steam 风格主区:左图右信息 */}
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          {screenshots.length > 0 ? (
            <Screenshots images={screenshots} />
          ) : (
            <div className="grid aspect-video place-items-center rounded-xl bg-gradient-to-br from-brand-500/20 to-brand-800/20 text-[rgb(var(--muted))]">
              暂无截图
            </div>
          )}
        </div>

        <aside className="space-y-3">
          <div className="card p-4 space-y-3">
            <div className="flex flex-wrap gap-1.5 text-xs">
              <Link href={`/apps?cat=${a.category.slug}`} className="chip"><Tag className="mr-1 h-3 w-3" />{a.category.name}</Link>
              {platforms.map((p) => <span key={p} className="chip">{p}</span>)}
              <span className="chip"><Calendar className="mr-1 h-3 w-3" />v{a.version}</span>
              {a.size && <span className="chip"><HardDrive className="mr-1 h-3 w-3" />{a.size}</span>}
              <span className="chip"><Download className="mr-1 h-3 w-3" />{a.downloadCount}</span>
            </div>
            <UnlockBox app={{ id: a.id, pricingMode: a.pricingMode, price: a.price, billingCycle: a.billingCycle, trialDesc: a.trialDesc, paymentChannels: a.paymentChannels, pricingDetail: a.pricingDetail, requirements: a.requirements }} unlocked={unlocked} />
          </div>

          <div className="card p-4">
            <div className="text-xs text-[rgb(var(--muted))]">开发者</div>
            <div className="mt-2 flex items-center gap-3">
              <Link href={`/u/${post.author.username}`} className="flex items-center gap-2 text-sm hover:text-brand-600">
                {post.author.avatar ? (
                  <img src={post.author.avatar} alt="" className="h-8 w-8 rounded-full" />
                ) : (
                  <div className="grid h-8 w-8 place-items-center rounded-full bg-brand-100 text-brand-700 font-medium">{post.author.nickname.slice(0, 1)}</div>
                )}
                <span className="font-medium">{post.author.nickname}</span>
              </Link>
              {session?.user && session.user.id !== post.authorId && (
                <FollowButton userId={post.authorId} initial={isFollowing} />
              )}
            </div>
            <div className="mt-2 text-xs text-[rgb(var(--muted))]">发布于 {fromNow(post.createdAt)}</div>
          </div>

          {tags.length > 0 && (
            <div className="card p-4">
              <div className="mb-2 text-xs text-[rgb(var(--muted))]">标签</div>
              <div className="flex flex-wrap gap-1.5">
                {tags.map((t) => <Link key={t} href={`/search?tag=${encodeURIComponent(t)}`} className="chip hover:bg-brand-100 dark:hover:bg-brand-900/40">#{t}</Link>)}
              </div>
            </div>
          )}
        </aside>
      </div>

      <div className="card p-6">
        <h2 className="mb-3 text-lg font-semibold">应用介绍</h2>
        <Markdown content={post.content} />
        {a.requirements && (
          <div className="mt-6 rounded-lg bg-[rgb(var(--hover))] p-4 text-sm">
            <div className="flex items-center gap-1 font-medium"><Cpu className="h-4 w-4" /> 运行要求</div>
            <p className="mt-1 text-[rgb(var(--muted))]">{a.requirements}</p>
          </div>
        )}
        <div className="mt-6 flex items-center gap-4 border-t border-[rgb(var(--border))] pt-4 text-sm text-[rgb(var(--muted))]">
          <LikeButton postId={post.id} initial={post.likeCount} liked={liked} size="md" />
          <FavoriteButton postId={post.id} initial={favorited} size="md" />
          <span>· {post.viewCount} 次浏览</span>
        </div>
      </div>

      <CommentSection postId={post.id} />
    </div>
  );
}

