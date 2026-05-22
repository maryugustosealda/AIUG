import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  let user; try { user = await requireUser(); } catch { return NextResponse.json({ error: "请先登录" }, { status: 401 }); }
  const room = await prisma.chatRoom.findUnique({ where: { id: params.id } });
  if (!room) return NextResponse.json({ error: "群组不存在" }, { status: 404 });
  if (room.visibility !== "public") return NextResponse.json({ error: "私密群无法直接加入" }, { status: 403 });
  try {
    await prisma.$transaction(async (tx) => {
      await tx.chatMember.create({ data: { roomId: room.id, userId: user.id } });
      await tx.chatRoom.update({ where: { id: room.id }, data: { memberCount: { increment: 1 } } });
      await tx.chatMessage.create({
        data: { roomId: room.id, authorId: user.id, type: "system", content: `${user.nickname} 加入了群组` },
      });
    });
  } catch (e: any) {
    if (e?.code === "P2002") return NextResponse.json({ ok: true }); // 已加入
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  let user; try { user = await requireUser(); } catch { return NextResponse.json({ error: "请先登录" }, { status: 401 }); }
  const room = await prisma.chatRoom.findUnique({ where: { id: params.id } });
  if (!room) return NextResponse.json({ error: "不存在" }, { status: 404 });
  if (room.creatorId === user.id) return NextResponse.json({ error: "群主不能退出,请解散群组" }, { status: 400 });
  const r = await prisma.chatMember.deleteMany({ where: { roomId: room.id, userId: user.id } });
  if (r.count) {
    await prisma.chatRoom.update({ where: { id: room.id }, data: { memberCount: { decrement: 1 } } });
    await prisma.chatMessage.create({
      data: { roomId: room.id, authorId: user.id, type: "system", content: `${user.nickname} 退出了群组` },
    });
  }
  return NextResponse.json({ ok: true });
}

