import Link from "next/link";
import { Heart, MessageSquare, Eye, Package, FileText, HelpCircle, Bookmark, Briefcase } from "lucide-react";
import { fromNow, safeJSON } from "@/lib/utils";
import LikeButton from "./like-button";

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
  const isMulti = covers.length >= 2;
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
      <div className="flex items-center gap-2 px-5 pt-4 text-sm text-[rgb(var(--muted))]">
        <Link href={`/u/${post.author.username}`} className="flex items-center gap-2 hover:text-brand-600">
          {post.author.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.author.avatar} alt="" className="h-6 w-6 rounded-full" />
          ) : (
            <div className="grid h-6 w-6 place-items-center rounded-full bg-brand-100 text-brand-700 text-xs">
              {post.author.nickname.slice(0, 1)}
            </div>
          )}
          <span className="font-medium text-[rgb(var(--fg))]">{post.author.nickname}</span>
        </Link>
        <span>·</span>
        <span>{fromNow(post.createdAt)}</span>
        {post.circle && (
          <>
            <span>·</span>
            <Link href={`/circles/${post.circle.slug}`} className="link">
              {post.circle.name}
            </Link>
          </>
        )}
        <span className="chip ml-auto inline-flex items-center gap-1">
          <TypeIcon type={post.type} /> {typeLabel(post.type)}
        </span>
      </div>

      {/* 标题 + 内容 + 图片 */}
      <Link href={href} className="block px-5 pt-3">
        <h2 className="text-lg font-semibold leading-snug hover:text-brand-600">{post.title}</h2>
        <p className={`mt-2 text-sm text-[rgb(var(--muted))] ${hasImages ? "line-clamp-2" : "line-clamp-3"}`}>
          {excerpt}
        </p>
      </Link>

      {/* 图片区:有图才渲染。多图用网格,单图大图。 */}
      {hasImages && (
        <Link href={href} className="mt-3 block">
          {isMulti ? (
            <div className={`grid gap-1 ${covers.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
              {covers.map((src, i) => (
                <div key={i} className="aspect-[4/3] overflow-hidden bg-[rgb(var(--hover))]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="h-full w-full object-cover transition group-hover:scale-105" />
                </div>
              ))}
            </div>
          ) : (
            <div className="aspect-[16/9] overflow-hidden bg-[rgb(var(--hover))]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={covers[0]} alt="" className="h-full w-full object-cover" />
            </div>
          )}
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
    </article>
  );
}


