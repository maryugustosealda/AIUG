import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import Markdown from "@/components/markdown";
import CommentSection from "@/components/post/comment-section";
import LikeButton from "@/components/post/like-button";
import FollowButton from "@/components/user/follow-button";
import Screenshots from "@/components/app/screenshots";
import ServiceContactBox from "@/components/service/contact-box";
import { fromNow, safeJSON } from "@/lib/utils";
import { Briefcase, Clock, Package as PackageIcon, CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

const CATEGORY_LABEL: Record<string, string> = {
  teaching: "教学/课程", consulting: "咨询答疑", customize: "定制开发",
  outsource: "代做服务", training: "训练/微调",
};

type Pkg = { name: string; price: number; deliveryDays: number; deliverables: string; description?: string | null };

export default async function ServiceDetailPage({ params }: { params: { id: string } }) {
  const post = await prisma.post.findFirst({
    where: { id: params.id, type: "service" },
    include: {
      author: { select: { id: true, username: true, nickname: true, avatar: true, bio: true } },
      circle: { select: { slug: true, name: true } },
      service: true,
    },
  });
  if (!post || !post.service) return notFound();

  const session = await auth();
  if (post.status !== "published" && post.authorId !== session?.user?.id && (session?.user as any)?.role !== "admin") {
    return notFound();
  }

  prisma.post.update({ where: { id: post.id }, data: { viewCount: { increment: 1 } } }).catch(() => {});

  const liked = session?.user
    ? !!(await prisma.like.findUnique({ where: { userId_postId: { userId: session.user.id, postId: post.id } } }))
    : false;
  const isFollowing = session?.user && session.user.id !== post.authorId
    ? !!(await prisma.follow.findUnique({ where: { followerId_followingId: { followerId: session.user.id, followingId: post.authorId } } }))
    : false;

  const tags = safeJSON<string[]>(post.tags, []);
  const samples = safeJSON<string[]>(post.service.workSamples, []);
  const pkgs = safeJSON<Pkg[]>(post.service.packages, []);
  const channels = safeJSON<string[]>(post.service.paymentChannels, []);
  const s = post.service;

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      {/* 标题区 */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2 text-xs text-[rgb(var(--muted))]">
          <span className="chip"><Briefcase className="mr-1 h-3 w-3" />{CATEGORY_LABEL[s.category] || s.category}</span>
          <span>· 发布于 {fromNow(post.createdAt)}</span>
          <span>· {post.viewCount} 次浏览</span>
        </div>
        <h1 className="text-2xl font-bold">{post.title}</h1>
        <p className="text-[rgb(var(--muted))]">{s.summary}</p>
      </div>

      {/* 双栏:左作品集+介绍 / 右套餐+联系 */}
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          {samples.length > 0 ? (
            <Screenshots images={samples} />
          ) : (
            <div className="grid aspect-video place-items-center rounded-xl bg-gradient-to-br from-brand-500/15 to-brand-800/15 text-[rgb(var(--muted))]">
              <Briefcase className="h-12 w-12 opacity-40" />
            </div>
          )}

          <div className="card p-6">
            <h2 className="mb-3 text-lg font-semibold">服务详情</h2>
            <Markdown content={post.content} />
            {tags.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-1.5">
                {tags.map((t) => <Link key={t} href={`/search?tag=${encodeURIComponent(t)}`} className="chip hover:bg-brand-100 dark:hover:bg-brand-900/40">#{t}</Link>)}
              </div>
            )}
            <div className="mt-6 flex items-center gap-4 border-t border-[rgb(var(--border))] pt-4 text-sm text-[rgb(var(--muted))]">
              <LikeButton postId={post.id} initial={post.likeCount} liked={liked} size="md" />
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          {/* 套餐区 */}
          <div className="card p-4 space-y-3">
            <h3 className="font-semibold">服务套餐</h3>
            {pkgs.map((p, i) => (
              <div key={i} className="rounded-lg border border-[rgb(var(--border))] p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="font-medium">{p.name}</div>
                  <div className="text-right">
                    {p.price > 0 ? (
                      <div className="text-lg font-bold text-brand-600">¥{p.price}</div>
                    ) : (
                      <div className="text-sm text-[rgb(var(--muted))]">面议</div>
                    )}
                  </div>
                </div>
                <div className="mt-1 flex items-center gap-2 text-xs text-[rgb(var(--muted))]">
                  <Clock className="h-3 w-3" /> {p.deliveryDays > 0 ? `${p.deliveryDays} 天交付` : "时间面议"}
                </div>
                <div className="mt-2 flex items-start gap-1.5 text-sm">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                  <span>{p.deliverables}</span>
                </div>
                {p.description && <p className="mt-1.5 text-xs text-[rgb(var(--muted))]">{p.description}</p>}
              </div>
            ))}
          </div>

          {/* 联系方式 */}
          <ServiceContactBox paymentChannels={channels} contactInfo={s.contactInfo} />

          {/* 作者卡片 */}
          <div className="card p-4">
            <div className="text-xs text-[rgb(var(--muted))]">服务提供者</div>
            <div className="mt-2 flex items-center gap-3">
              <Link href={`/u/${post.author.username}`} className="flex items-center gap-2 hover:text-brand-600">
                {post.author.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={post.author.avatar} alt="" className="h-8 w-8 rounded-full" />
                ) : (
                  <div className="grid h-8 w-8 place-items-center rounded-full bg-brand-100 text-brand-700 font-medium">{post.author.nickname.slice(0, 1)}</div>
                )}
                <span className="font-medium text-sm">{post.author.nickname}</span>
              </Link>
              {session?.user && session.user.id !== post.authorId && (
                <FollowButton userId={post.authorId} initial={isFollowing} />
              )}
            </div>
            {post.author.bio && <p className="mt-2 text-xs text-[rgb(var(--muted))]">{post.author.bio}</p>}
          </div>
        </aside>
      </div>

      <CommentSection postId={post.id} />
    </div>
  );
}

