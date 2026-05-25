import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

/**
 * 加入圈子
 */
export async function POST(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  let user;
  try {
    user = await requireUser();
  } catch {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }
  const circle = await prisma.circle.findUnique({
    where: { slug: params.slug },
    select: { id: true },
  });
  if (!circle) return NextResponse.json({ error: "圈子不存在" }, { status: 404 });

  await prisma.$transaction(async (tx) => {
    const existing = await tx.circleMember.findUnique({
      where: { userId_circleId: { userId: user.id, circleId: circle.id } },
    });
    if (existing) return;
    await tx.circleMember.create({
      data: { userId: user.id, circleId: circle.id },
    });
    await tx.circle.update({
      where: { id: circle.id },
      data: { memberCount: { increment: 1 } },
    });
  });
  return NextResponse.json({ ok: true, joined: true });
}

/**
 * 退出圈子
 */
export async function DELETE(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  let user;
  try {
    user = await requireUser();
  } catch {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }
  const circle = await prisma.circle.findUnique({
    where: { slug: params.slug },
    select: { id: true },
  });
  if (!circle) return NextResponse.json({ error: "圈子不存在" }, { status: 404 });

  await prisma.$transaction(async (tx) => {
    const existing = await tx.circleMember.findUnique({
      where: { userId_circleId: { userId: user.id, circleId: circle.id } },
    });
    if (!existing) return;
    await tx.circleMember.delete({
      where: { userId_circleId: { userId: user.id, circleId: circle.id } },
    });
    await tx.circle.update({
      where: { id: circle.id },
      data: { memberCount: { decrement: 1 } },
    });
  });
  return NextResponse.json({ ok: true, joined: false });
}

