import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  let user; try { user = await requireUser(); } catch { return NextResponse.json({ error: "请先登录" }, { status: 401 }); }
  if (user.id === params.id) return NextResponse.json({ error: "不能关注自己" }, { status: 400 });
  try {
    await prisma.follow.create({ data: { followerId: user.id, followingId: params.id } });
    await prisma.notification.create({
      data: { receiverId: params.id, senderId: user.id, type: "follow" },
    });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e?.code === "P2002") return NextResponse.json({ ok: true });
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  let user; try { user = await requireUser(); } catch { return NextResponse.json({ error: "请先登录" }, { status: 401 }); }
  await prisma.follow.deleteMany({ where: { followerId: user.id, followingId: params.id } });
  return NextResponse.json({ ok: true });
}

