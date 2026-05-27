import Link from "next/link";
import { Heart, MessageSquare, Eye, Package, FileText, HelpCircle, Bookmark, Briefcase } from "lucide-react";
import { fromNow, safeJSON } from "@/lib/utils";
import LikeButton from "./like-button";
import CommentPreview from "./comment-preview";

type PostComment = {
  id: string;
  content: string;
  createdAt: string | Date;
  author: { nickname: string; avatar: string | null };
};

type PostInList = {
  id: string;
  type: string;
  title: string;
  content: string;
  cover: string | null;
  images: string | null;
  tags: string | null;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  createdAt: Date | string;
  author: { id: string; username: string; nickname: string; avatar: string | null };
  circle: { slug: string; name: string } | null;
  app: { id: string; logo: string | null; screenshots?: string | null; pricingMode: string; price: number } | null;
  comments?: PostComment[];
  liked?: boolean;
};

const TypeIcon = ({ type }: { type: string }) => {
  if (type === "app") return <Package className="h-3.5 w-3.5" />;
  if (type === "service") return <Briefcase className="h-3.5 w-3.5" />;
  if (type === "question") return <HelpCircle className="h-3.5 w-3.5" />;
  return <FileText className="h-3.5 w-3.5" />;
};
const typeLabel = (t: string) =>
  ({ app: "应用", service: "技能", question: "提问", text: "分享" } as Record<string, string>)[t] || t;

/**
 * 选一张展示图:
 * 应用 -> 首张截图 > cover > logo
 * 普通帖 -> cover > images[0]
 * 都没就 null,走纯文字版式
 */
function pickCoverImages(post: PostInList): string[] {
  if (post.type === "app" && post.app) {
    const shots = safeJSON<string[]>(post.app.screenshots ?? null, []);
    if (shots.length) return shots.slice(0, 3);
    if (post.cover) return [post.cover];
    if (post.app.logo) return [post.app.logo];
    return [];
  }
  if (post.cover) return [post.cover];
  const imgs = safeJSON<string[]>(post.images, []);
  return imgs.slice(0, 3);
}

export default function PostCard({
  post,
  variant = "default",
}: {
  post: PostInList;
  variant?: "default" | "discussion";
}) {
  const tags = safeJSON<string[]>(post.tags, []);
  const excerpt = post.content.replace(/[#*`>\-\[\]\(\)]/g, "").slice(0, 200);
  const href = post.type === "app" ? `/apps/${post.id}` : post.type === "service" ? `/services/${post.id}` : `/post/${post.id}`;
  const covers = pickCoverImages(post);
  const hasImages = covers.length > 0;
  const isDiscussion = variant === "discussion";

  return (
    <article
      className={
        isDiscussion
          ? "card-tech overflow-hidden transition hover:border-[rgb(var(--accent))]/30"
          : "card overflow-hidden hover:border-brand-300 dark:hover:border-brand-700 transition-colors"
      }
    >
      {/* 顶部 meta */}
      <div className="flex items-center gap-3 px-5 pt-4 text-sm text-[rgb(var(--muted))]">
        <Link href={`/u/${post.author.username}`} className="flex items-center gap-2 hover:text-brand-600">
          {post.author.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.author.avatar} alt="" className="h-9 w-9 rounded-full object-cover ring-2 ring-[rgb(var(--border))]/50" />
          ) : (
            <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-brand-500/20 to-violet-500/20 text-brand-600 text-sm font-bold">
              {post.author.nickname.slice(0, 1)}
            </div>
          )}
          <div>
            <span className="font-medium text-[rgb(var(--fg))] text-sm">{post.author.nickname}</span>
            <div className="text-xs text-[rgb(var(--muted))]">{fromNow(post.createdAt)}</div>
          </div>
        </Link>
        {post.circle && (
          <Link href={`/circles/${post.circle.slug}`} className="chip text-xs ml-1">
            {post.circle.name}
          </Link>
        )}
        <span className="chip ml-auto inline-flex items-center gap-1">
          <TypeIcon type={post.type} /> {typeLabel(post.type)}
        </span>
      </div>

      {/* 标题 + 内容 + 图片 */}
      <Link href={href} className="block px-5 pt-3">
        <h2 className="text-base font-semibold leading-snug hover:text-brand-600">{post.title}</h2>
        <p className={`mt-1.5 text-sm text-[rgb(var(--muted))] ${hasImages ? "line-clamp-2" : "line-clamp-3"}`}>
          {excerpt}
        </p>
      </Link>

      {/* 图片区：小缩略图，不占太大空间 */}
      {hasImages && (
        <Link href={href} className="mt-2 block px-5">
          <div className="flex gap-2 overflow-hidden">
            {covers.slice(0, 4).map((src, i) => (
              <div key={i} className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-[rgb(var(--hover))]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="h-full w-full object-cover" />
              </div>
            ))}
            {covers.length > 4 && (
              <div className="grid h-16 w-16 shrink-0 place-items-center rounded-lg bg-[rgb(var(--hover))] text-xs text-[rgb(var(--muted))]">
                +{covers.length - 4}
              </div>
            )}
          </div>
        </Link>
      )}

      {/* 底部 tags + 操作 */}
      <div className="flex flex-wrap items-center gap-2 px-5 py-3">
        {tags.slice(0, 4).map((t) => (
          <Link key={t} href={`/search?tag=${encodeURIComponent(t)}`} className="chip hover:bg-brand-100 dark:hover:bg-brand-900/40">
            #{t}
          </Link>
        ))}
        {post.type === "app" && post.app && (
          <span className="chip bg-brand-50 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300">
            {post.app.pricingMode === "free" ? "免费" : post.app.pricingMode === "trial" ? "试用" : `¥${post.app.price.toFixed(2)}`}
          </span>
        )}
        <div className="ml-auto flex items-center gap-3 text-sm text-[rgb(var(--muted))]">
          <LikeButton postId={post.id} initial={post.likeCount} liked={!!post.liked} />
          <Link href={href} className="flex items-center gap-1 hover:text-brand-600">
            <MessageSquare className="h-4 w-4" /> {post.commentCount}
          </Link>
          <span className="flex items-center gap-1">
            <Eye className="h-4 w-4" /> {post.viewCount}
          </span>
        </div>
      </div>

      {/* 评论预览 + 快速评论 */}
      <CommentPreview
        postId={post.id}
        comments={(post.comments || []).map((c) => ({
          id: c.id,
          content: c.content,
          createdAt: typeof c.createdAt === "string" ? c.createdAt : (c.createdAt as Date).toISOString(),
          author: c.author,
        })).reverse()}
        total={post.commentCount}
        href={href}
      />
    </article>
  );
}