import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * 我的关注与粉丝列表
 * GET /api/me/follows?type=following | followers
 */
export async function GET(req: Request) {
  let user;
  try {
    user = await requireUser();
  } catch {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }
  const url = new URL(req.url);
  const type = url.searchParams.get("type") === "followers" ? "followers" : "following";
  const take = Math.min(parseInt(url.searchParams.get("take") || "50", 10), 100);

  if (type === "following") {
    const rows = await prisma.follow.findMany({
      where: { followerId: user.id },
      orderBy: { createdAt: "desc" },
      take,
      include: {
        following: {
          select: {
            id: true,
            username: true,
            nickname: true,
            avatar: true,
            bio: true,
          },
        },
      },
    });
    return NextResponse.json({
      items: rows.map((r) => r.following),
    });
  }

  const rows = await prisma.follow.findMany({
    where: { followingId: user.id },
    orderBy: { createdAt: "desc" },
    take,
    include: {
      follower: {
        select: {
          id: true,
          username: true,
          nickname: true,
          avatar: true,
          bio: true,
        },
      },
    },
  });
  return NextResponse.json({
    items: rows.map((r) => r.follower),
  });
}

