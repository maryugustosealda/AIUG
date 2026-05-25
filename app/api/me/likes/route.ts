import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * 我点赞过的帖子
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

  const likes = await prisma.like.findMany({
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
  if (likes.length > take) nextCursor = likes.pop()!.id;

  return NextResponse.json({
    items: likes.filter((l) => l.post).map((l) => l.post),
    nextCursor,
  });
}

