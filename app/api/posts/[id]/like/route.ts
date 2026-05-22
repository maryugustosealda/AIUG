import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  let user;
  try { user = await requireUser(); } catch { return NextResponse.json({ error: "请先登录" }, { status: 401 }); }
  try {
    const post = await prisma.post.findUnique({ where: { id: params.id }, select: { id: true, authorId: true } });
    if (!post) return NextResponse.json({ error: "不存在" }, { status: 404 });
    await prisma.like.create({ data: { userId: user.id, postId: post.id } });
    await prisma.post.update({ where: { id: post.id }, data: { likeCount: { increment: 1 }, hot: { increment: 1 } } });
    if (post.authorId !== user.id) {
      await prisma.notification.create({
        data: { receiverId: post.authorId, senderId: user.id, type: "like", targetType: "post", targetId: post.id },
      });
    }
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e?.code === "P2002") return NextResponse.json({ ok: true }); // already liked
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  let user;
  try { user = await requireUser(); } catch { return NextResponse.json({ error: "请先登录" }, { status: 401 }); }
  const r = await prisma.like.deleteMany({ where: { userId: user.id, postId: params.id } });
  if (r.count) {
    await prisma.post.update({ where: { id: params.id }, data: { likeCount: { decrement: 1 } } });
  }
  return NextResponse.json({ ok: true });
}

