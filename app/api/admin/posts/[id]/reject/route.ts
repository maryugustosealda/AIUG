import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "无权限" }, { status: 403 }); }
  const { reason } = await req.json();
  if (!reason) return NextResponse.json({ error: "请填写驳回原因" }, { status: 400 });
  const post = await prisma.post.findUnique({ where: { id: params.id } });
  if (!post) return NextResponse.json({ error: "不存在" }, { status: 404 });
  await prisma.post.update({ where: { id: post.id }, data: { status: "rejected", rejectReason: reason } });
  await prisma.notification.create({
    data: { receiverId: post.authorId, type: "app_review", targetType: "post", targetId: post.id, content: `审核未通过:${reason}` },
  });
  return NextResponse.json({ ok: true });
}

