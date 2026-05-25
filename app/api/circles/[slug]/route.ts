import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * 圈子详情 + 该圈子的帖子列表
 * GET /api/circles/[slug]?cursor=&take=
 */
export async function GET(
  req: Request,
  { params }: { params: { slug: string } }
) {
  const url = new URL(req.url);
  const cursor = url.searchParams.get("cursor") ?? undefined;
  const take = Math.min(parseInt(url.searchParams.get("take") || "20", 10), 50);

  const circle = await prisma.circle.findUnique({
    where: { slug: params.slug },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      icon: true,
      cover: true,
      postCount: true,
      memberCount: true,
      createdAt: true,
    },
  });
  if (!circle) {
    return NextResponse.json({ error: "圈子不存在" }, { status: 404 });
  }

  let userId: string | undefined;
  try {
    const u = await requireUser();
    userId = u.id;
  } catch {}

  const joined = userId
    ? !!(await prisma.circleMember.findUnique({
        where: { userId_circleId: { userId, circleId: circle.id } },
      }))
    : false;

  const posts = await prisma.post.findMany({
    where: { circleId: circle.id, status: "published" },
    orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
    take: take + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    select: {
      id: true,
      type: true,
      title: true,
      cover: true,
      images: true,
      likeCount: true,
      commentCount: true,
      createdAt: true,
      author: {
        select: { id: true, username: true, nickname: true, avatar: true },
      },
      app: { select: { id: true, name: true, logo: true, pricingMode: true, price: true } },
    },
  });

  let nextCursor: string | null = null;
  if (posts.length > take) {
    nextCursor = posts.pop()!.id;
  }

  return NextResponse.json({
    circle: { ...circle, joined },
    items: posts,
    nextCursor,
  });
}

