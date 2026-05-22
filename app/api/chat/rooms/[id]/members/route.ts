import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const members = await prisma.chatMember.findMany({
    where: { roomId: params.id },
    orderBy: [{ role: "desc" }, { joinedAt: "asc" }],
    include: { user: { select: { id: true, username: true, nickname: true, avatar: true } } },
  });
  return NextResponse.json({ members });
}

