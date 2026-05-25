import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

/**
 * 切换收藏状态
 */
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  let user;
  try {
    user = await requireUser();
  } catch {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }
  const post = await prisma.post.findUnique({
    where: { id: params.id },
    select: { id: true, favoriteCount: true },
  });
  if (!post) return NextResponse.json({ error: "不存在" }, { status: 404 });

  const existing = await prisma.favorite.findUnique({
    where: { userId_postId: { userId: user.id, postId: post.id } },
  });

  if (existing) {
    await prisma.$transaction([
      prisma.favorite.delete({
        where: { userId_postId: { userId: user.id, postId: post.id } },
      }),
      prisma.post.update({
        where: { id: post.id },
        data: { favoriteCount: { decrement: 1 } },
      }),
    ]);
    return NextResponse.json({
      ok: true,
      favorited: false,
      favoriteCount: Math.max(0, post.favoriteCount - 1),
    });
  }

  await prisma.$transaction([
    prisma.favorite.create({ data: { userId: user.id, postId: post.id } }),
    prisma.post.update({
      where: { id: post.id },
      data: { favoriteCount: { increment: 1 } },
    }),
  ]);
  return NextResponse.json({
    ok: true,
    favorited: true,
    favoriteCount: post.favoriteCount + 1,
  });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  let user;
  try {
    user = await requireUser();
  } catch {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }
  const r = await prisma.favorite.deleteMany({
    where: { userId: user.id, postId: params.id },
  });
  if (r.count) {
    await prisma.post.update({
      where: { id: params.id },
      data: { favoriteCount: { decrement: 1 } },
    });
  }
  return NextResponse.json({ ok: true, favorited: false });
}

