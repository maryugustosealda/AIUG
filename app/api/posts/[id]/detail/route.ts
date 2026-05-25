import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * 移动端 / 第三方使用的帖子详情接口。
 * 返回精简、稳定的字段集,与 /api/posts/list 形状一致 + 完整内容。
 */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  let userId: string | null = null;
  try {
    const u = await requireUser();
    userId = u.id;
  } catch {
    userId = null;
  }

  const p = await prisma.post.findUnique({
    where: { id: params.id },
    include: {
      author: { select: { id: true, username: true, nickname: true, avatar: true } },
      app: true,
      circle: { select: { id: true, slug: true, name: true } },
    },
  });
  if (!p || p.status !== "published") {
    return NextResponse.json({ error: "帖子不存在" }, { status: 404 });
  }

  let liked = false;
  let favorited = false;
  if (userId) {
    const [l, f] = await Promise.all([
      prisma.like.findUnique({ where: { userId_postId: { userId, postId: p.id } } }),
      prisma.favorite.findUnique({ where: { userId_postId: { userId, postId: p.id } } }),
    ]);
    liked = !!l;
    favorited = !!f;
  }

  // 异步增 view(不阻塞响应)
  prisma.post
    .update({ where: { id: p.id }, data: { viewCount: { increment: 1 } } })
    .catch(() => {});

  return NextResponse.json({
    id: p.id,
    type: (p.type || "text").toUpperCase(),
    title: p.title,
    content: p.content,
    images: parseJsonArray(p.images),
    cover: p.cover ?? null,
    tags: parseJsonArray(p.tags),
    author: {
      id: p.author?.id,
      name: p.author?.nickname || p.author?.username || "匿名",
      avatar: p.author?.avatar || null,
    },
    app: p.app
      ? {
          id: p.app.id,
          name: p.app.name,
          summary: p.app.summary,
          logo: p.app.logo || null,
          screenshots: parseJsonArray(p.app.screenshots),
          version: p.app.version,
          size: p.app.size,
          platforms: parseJsonArray(p.app.platforms),
          pricingMode: p.app.pricingMode,
          price: p.app.price,
          downloadCount: p.app.downloadCount,
        }
      : null,
    circle: p.circle ? { id: p.circle.slug, name: p.circle.name } : null,
    likeCount: p.likeCount ?? 0,
    commentCount: p.commentCount ?? 0,
    favoriteCount: p.favoriteCount ?? 0,
    viewCount: (p.viewCount ?? 0) + 1,
    liked,
    favorited,
    createdAt: p.createdAt,
  });
}

function parseJsonArray(raw: any): any[] {
  if (Array.isArray(raw)) return raw;
  if (typeof raw !== "string" || !raw) return [];
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

