import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

const Schema = z.object({ content: z.string().min(1).max(2000), parentId: z.string().optional().nullable() });

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const comments = await prisma.comment.findMany({
    where: { postId: params.id, parentId: null },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      author: { select: { id: true, username: true, nickname: true, avatar: true } },
      replies: {
        orderBy: { createdAt: "asc" },
        take: 20,
        include: { author: { select: { id: true, username: true, nickname: true, avatar: true } } },
      },
    },
  });
  return NextResponse.json({ comments });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  let user;
  try { user = await requireUser(); } catch { return NextResponse.json({ error: "请先登录" }, { status: 401 }); }
  try {
    const data = Schema.parse(await req.json());
    const post = await prisma.post.findUnique({ where: { id: params.id }, select: { id: true, authorId: true } });
    if (!post) return NextResponse.json({ error: "不存在" }, { status: 404 });
    const comment = await prisma.comment.create({
      data: { postId: post.id, authorId: user.id, content: data.content, parentId: data.parentId || null },
      include: { author: { select: { id: true, username: true, nickname: true, avatar: true } } },
    });
    await prisma.post.update({ where: { id: post.id }, data: { commentCount: { increment: 1 }, hot: { increment: 2 } } });
    if (post.authorId !== user.id) {
      await prisma.notification.create({
        data: { receiverId: post.authorId, senderId: user.id, type: "comment", targetType: "post", targetId: post.id, content: data.content.slice(0, 80) },
      });
    }
    return NextResponse.json({ comment });
  } catch (e: any) {
    if (e?.issues) return NextResponse.json({ error: e.issues[0]?.message }, { status: 400 });
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

