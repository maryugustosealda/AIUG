import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { makeBadge } from "@/lib/badge";

export const dynamic = "force-dynamic";

/**
 * 一次性迁移:把残留的「AIUG 茶水间」/「茶水间」/任何包含「茶水间」的群组,统一更名为 AIUG。
 * 用 Authorization: Bearer <NEXTAUTH_SECRET> 鉴权,跑完即可下线该端点。
 */
export async function POST(req: Request) {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) return NextResponse.json({ error: "secret not set" }, { status: 500 });
  const auth = req.headers.get("authorization") || "";
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const targets = await prisma.chatRoom.findMany({
    where: { OR: [{ name: { contains: "茶水间" } }] },
  });

  const updated: { id: string; oldName: string; newName: string }[] = [];
  for (const r of targets) {
    await prisma.chatRoom.update({
      where: { id: r.id },
      data: {
        name: "AIUG",
        description: "AIUG 官方公开群组,新人欢迎、随便聊。",
        icon: makeBadge("chat", "indigo"),
      },
    });
    updated.push({ id: r.id, oldName: r.name, newName: "AIUG" });
  }

  return NextResponse.json({ ok: true, updated });
}

