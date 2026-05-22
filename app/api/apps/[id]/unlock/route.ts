import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  let user; try { user = await requireUser(); } catch { return NextResponse.json({ error: "请先登录" }, { status: 401 }); }
  const app = await prisma.app.findUnique({ where: { id: params.id }, include: { post: true } });
  if (!app) return NextResponse.json({ error: "不存在" }, { status: 404 });
  if (app.post.status !== "published") return NextResponse.json({ error: "应用尚未上架" }, { status: 400 });

  const exist = await prisma.unlock.findUnique({ where: { userId_appId: { userId: user.id, appId: app.id } } });
  if (exist) {
    return NextResponse.json({ ok: true, link: { url: app.downloadUrl, password: app.downloadPwd } });
  }

  if (app.pricingMode === "paid") {
    return NextResponse.json({ error: "付费应用支付功能尚未上线,敬请期待" }, { status: 402 });
  }

  await prisma.unlock.create({
    data: { userId: user.id, appId: app.id, mode: app.pricingMode, amount: 0 },
  });
  await prisma.app.update({ where: { id: app.id }, data: { downloadCount: { increment: 1 } } });
  return NextResponse.json({ ok: true, link: { url: app.downloadUrl, password: app.downloadPwd } });
}

