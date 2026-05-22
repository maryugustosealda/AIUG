import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

// 拉取消息(支持 ?after=msgId 拉取增量,或 ?before=msgId 翻历史)
export async function GET(req: Request, { params }: { params: { id: string } }) {
  let user; try { user = await requireUser(); } catch { return NextResponse.json({ error: "请先登录" }, { status: 401 }); }
  const url = new URL(req.url);
  const after = url.searchParams.get("after");
  const before = url.searchParams.get("before");

  const member = await prisma.chatMember.findUnique({
    where: { roomId_userId: { roomId: params.id, userId: user.id } },
  });
  const room = await prisma.chatRoom.findUnique({ where: { id: params.id } });
  if (!room) return NextResponse.json({ error: "不存在" }, { status: 404 });
  if (!member && room.visibility !== "public") return NextResponse.json({ error: "不是成员" }, { status: 403 });

  let cursorClause: any = {};
  if (after) {
    const m = await prisma.chatMessage.findUnique({ where: { id: after }, select: { createdAt: true } });
    if (m) cursorClause = { createdAt: { gt: m.createdAt } };
  } else if (before) {
    const m = await prisma.chatMessage.findUnique({ where: { id: before }, select: { createdAt: true } });
    if (m) cursorClause = { createdAt: { lt: m.createdAt } };
  }

  const messages = await prisma.chatMessage.findMany({
    where: { roomId: params.id, ...cursorClause },
    orderBy: { createdAt: after ? "asc" : "desc" },
    take: 50,
    include: { author: { select: { id: true, username: true, nickname: true, avatar: true } } },
  });

  // 已读时间更新
  if (member) {
    prisma.chatMember.update({
      where: { roomId_userId: { roomId: params.id, userId: user.id } },
      data: { lastReadAt: new Date() },
    }).catch(() => {});
  }

  return NextResponse.json({
    messages: after ? messages : messages.reverse(),
    isMember: !!member,
  });
}

const Schema = z.object({ content: z.string().min(1).max(2000) });

export async function POST(req: Request, { params }: { params: { id: string } }) {
  let user; try { user = await requireUser(); } catch { return NextResponse.json({ error: "请先登录" }, { status: 401 }); }
  try {
    const data = Schema.parse(await req.json());
    const room = await prisma.chatRoom.findUnique({ where: { id: params.id } });
    if (!room) return NextResponse.json({ error: "不存在" }, { status: 404 });

    let member = await prisma.chatMember.findUnique({
      where: { roomId_userId: { roomId: params.id, userId: user.id } },
    });
    // 公开群发消息时自动加入
    if (!member) {
      if (room.visibility !== "public") return NextResponse.json({ error: "不是成员" }, { status: 403 });
      member = await prisma.chatMember.create({ data: { roomId: room.id, userId: user.id } });
      await prisma.chatRoom.update({ where: { id: room.id }, data: { memberCount: { increment: 1 } } });
    }

    const message = await prisma.chatMessage.create({
      data: { roomId: room.id, authorId: user.id, content: data.content, type: "text" },
      include: { author: { select: { id: true, username: true, nickname: true, avatar: true } } },
    });
    await prisma.chatRoom.update({ where: { id: room.id }, data: { lastMsgAt: new Date() } });
    return NextResponse.json({ message });
  } catch (e: any) {
    if (e?.issues) return NextResponse.json({ error: e.issues[0]?.message }, { status: 400 });
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

