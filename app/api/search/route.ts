import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * 合并搜索:同时返回匹配的圈子与帖子(供 App 端搜索框使用)
 * GET /api/search?q=...&take=
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") || "").trim();
  const take = Math.min(parseInt(url.searchParams.get("take") || "20", 10), 50);

  if (!q) {
    return NextResponse.json({ circles: [], posts: [] });
  }

  // SQLite 用 contains(默认大小写不敏感取决于 collation)
  const [circles, posts] = await Promise.all([
    prisma.circle.findMany({
      where: {
        OR: [
          { name: { contains: q } },
          { description: { contains: q } },
          { slug: { contains: q } },
        ],
      },
      orderBy: { postCount: "desc" },
      take,
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        icon: true,
        memberCount: true,
        postCount: true,
      },
    }),
    prisma.post.findMany({
      where: {
        status: "published",
        OR: [
          { title: { contains: q } },
          { content: { contains: q } },
          { tags: { contains: q } },
        ],
      },
      orderBy: { createdAt: "desc" },
      take,
      select: {
        id: true,
        type: true,
        title: true,
        cover: true,
        likeCount: true,
        commentCount: true,
        createdAt: true,
        author: {
          select: { id: true, username: true, nickname: true, avatar: true },
        },
        circle: { select: { id: true, slug: true, name: true } },
      },
    }),
  ]);

  return NextResponse.json({ circles, posts });
}

