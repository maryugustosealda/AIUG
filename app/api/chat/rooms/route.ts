import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth, requireAdmin } from "@/lib/auth";

// 列出公开群组 + 我加入的
export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;
  const [publicRooms, joined] = await Promise.all([
    prisma.chatRoom.findMany({
      where: { visibility: "public" },
      orderBy: { lastMsgAt: "desc" },
      take: 50,
      include: { creator: { select: { username: true, nickname: true } } },
    }),
    userId
      ? prisma.chatMember.findMany({
          where: { userId },
          orderBy: { room: { lastMsgAt: "desc" } },
          include: { room: { include: { creator: { select: { username: true, nickname: true } } } } },
        })
      : Promise.resolve([]),
  ]);
  return NextResponse.json({
    publicRooms,
    myRooms: joined.map((m) => m.room),
  });
}

const Schema = z.object({
  name: z.string().min(2).max(30),
  description: z.string().max(200).optional().nullable(),
  icon: z.string().max(8).optional().nullable(),
  visibility: z.enum(["public", "private"]).default("public"),
});

export async function POST(req: Request) {
  let user;
  try {
    user = await requireAdmin();
  } catch (e: any) {
    if (e?.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }
    return NextResponse.json({ error: "仅管理员可创建群组" }, { status: 403 });
  }
  try {
    const data = Schema.parse(await req.json());
    const room = await prisma.$transaction(async (tx) => {
      const r = await tx.chatRoom.create({
        data: { ...data, creatorId: user.id, memberCount: 1 },
      });
      await tx.chatMember.create({
        data: { roomId: r.id, userId: user.id, role: "owner" },
      });
      await tx.chatMessage.create({
        data: { roomId: r.id, authorId: user.id, type: "system", content: `${user.nickname} 创建了群组` },
      });
      return r;
    });
    return NextResponse.json({ room });
  } catch (e: any) {
    if (e?.issues) return NextResponse.json({ error: e.issues[0]?.message }, { status: 400 });
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

