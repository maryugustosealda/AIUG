import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getFeed, type FeedSort } from "@/lib/feed";

export const dynamic = "force-dynamic";

/**
 * 移动端 / 第三方使用的帖子列表接口。
 * 返回精简、稳定的字段集,不暴露内部数据库形状。
 *
 * Query:
 *   sort=latest|hot
 *   cursor=<postId>   (向下翻页:取该 id 之后的)
 *   take=<1..50>
 *   circle=<slug>     (可选,仅返回某个圈子的帖子)
 *   tag=<string>      (可选)
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const sort = (url.searchParams.get("sort") as FeedSort) || "latest";
  const cursor = url.searchParams.get("cursor");
  const takeRaw = parseInt(url.searchParams.get("take") || "20", 10);
  const take = Math.min(Math.max(takeRaw || 20, 1), 50);
  const circleSlug = url.searchParams.get("circle");
  const tag = url.searchParams.get("tag") || undefined;

  let circleId: string | undefined;
  if (circleSlug) {
    const c = await prisma.circle.findUnique({
      where: { slug: circleSlug },
      select: { id: true },
    });
    if (!c) return NextResponse.json({ items: [], nextCursor: null });
    circleId = c.id;
  }

  // 用 cursor 实现简单翻页:再多取一条用于判断是否还有下一页
  let skip = 0;
  if (cursor) {
    // 找到 cursor 所在的位置
    const idx = await prisma.post.findFirst({
      where: { id: cursor, status: "published" },
      select: { createdAt: true },
    });
    if (idx) {
      skip = await prisma.post.count({
        where: {
          status: "published",
          ...(circleId ? { circleId } : {}),
          createdAt: { gte: idx.createdAt },
        },
      });
    }
  }

  const feed = await getFeed({ sort, circleId, tag, take: take + 1, skip });
  const hasMore = feed.length > take;
  const items = feed.slice(0, take).map(formatPost);
  const nextCursor = hasMore ? feed[take - 1].id : null;

  return NextResponse.json({ items, nextCursor });
}

function formatPost(p: any) {
  return {
    id: p.id,
    type: (p.type || "text").toUpperCase() as "TEXT" | "IMAGE" | "APP" | "SERVICE",
    title: p.title,
    content: p.content,
    images: parseJsonArray(p.images),
    cover: p.cover ?? null,
    author: {
      id: p.author?.id,
      name: p.author?.nickname || p.author?.username || "匿名",
      avatar: p.author?.avatar || null,
    },
    app: p.app
      ? {
          id: p.app.id,
          name: p.title || "",
          logo: p.app.logo || null,
          screenshots: parseJsonArray(p.app.screenshots),
        }
      : null,
    circle: p.circle ? { id: p.circle.slug, name: p.circle.name } : null,
    likeCount: p.likeCount ?? 0,
    commentCount: p.commentCount ?? 0,
    liked: !!p.liked,
    createdAt: p.createdAt,
  };
}

function parseJsonArray(raw: any): string[] {
  if (Array.isArray(raw)) return raw;
  if (typeof raw !== "string" || !raw) return [];
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

