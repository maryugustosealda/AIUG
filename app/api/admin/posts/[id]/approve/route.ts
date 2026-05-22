import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "无权限" }, { status: 403 }); }
  const post = await prisma.post.findUnique({ where: { id: params.id }, include: { app: true } });
  if (!post) return NextResponse.json({ error: "不存在" }, { status: 404 });

  await prisma.$transaction(async (tx) => {
    await tx.post.update({ where: { id: post.id }, data: { status: "published", rejectReason: null } });
    if (post.app) {
      await tx.app.update({ where: { id: post.app.id }, data: { linkLocked: true } });
    }
    if (post.circleId) {
      await tx.circle.update({ where: { id: post.circleId }, data: { postCount: { increment: 1 } } });
    }
    await tx.notification.create({
      data: { receiverId: post.authorId, type: "app_review", targetType: "post", targetId: post.id, content: "审核通过,内容已上架" },
    });
  });

  return NextResponse.json({ ok: true });
}

