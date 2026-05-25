import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * 我的收藏列表
 */
export async function GET(req: Request) {
  let user;
  try {
    user = await requireUser();
  } catch {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }
  const url = new URL(req.url);
  const cursor = url.searchParams.get("cursor") ?? undefined;
  const take = Math.min(parseInt(url.searchParams.get("take") || "20", 10), 50);

  const favs = await prisma.favorite.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: take + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    include: {
      post: {
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
        },
      },
    },
  });

  let nextCursor: string | null = null;
  if (favs.length > take) nextCursor = favs.pop()!.id;

  return NextResponse.json({
    items: favs.filter((f) => f.post).map((f) => f.post),
    nextCursor,
  });
}

