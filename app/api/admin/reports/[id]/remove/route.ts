import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "无权限" }, { status: 403 }); }
  const report = await prisma.report.findUnique({ where: { id: params.id } });
  if (!report) return NextResponse.json({ error: "不存在" }, { status: 404 });
  await prisma.$transaction(async (tx) => {
    await tx.report.update({ where: { id: report.id }, data: { status: "resolved" } });
    if (report.postId) {
      await tx.post.update({ where: { id: report.postId }, data: { status: "removed" } });
    }
  });
  return NextResponse.json({ ok: true });
}

