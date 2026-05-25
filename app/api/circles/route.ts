import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * 圈子列表(支持移动端 Bearer / 网页端 cookie)
 * 返回所有圈子,如果带登录态则附带"我是否加入"字段
 */
export async function GET() {
  let userId: string | undefined;
  try {
    const u = await requireUser();
    userId = u.id;
  } catch {
    userId = undefined;
  }

  const circles = await prisma.circle.findMany({
    orderBy: [{ postCount: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      icon: true,
      cover: true,
      postCount: true,
      memberCount: true,
      createdAt: true,
    },
  });

  let joinedSet = new Set<string>();
  if (userId) {
    const members = await prisma.circleMember.findMany({
      where: { userId },
      select: { circleId: true },
    });
    joinedSet = new Set(members.map((m) => m.circleId));
  }

  return NextResponse.json({
    circles: circles.map((c) => ({ ...c, joined: joinedSet.has(c.id) })),
  });
}

