import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMobileUserFromHeader } from "@/lib/mobile-token";
import { isAdminEmail } from "@/lib/utils";

export const dynamic = "force-dynamic";

/**
 * 校验 token 并返回当前用户最新信息
 */
export async function GET(req: Request) {
  const payload = await getMobileUserFromHeader(req);
  if (!payload) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({
    where: { id: payload.uid },
    select: {
      id: true,
      email: true,
      username: true,
      nickname: true,
      avatar: true,
      bio: true,
      role: true,
      createdAt: true,
    },
  });
  if (!user) {
    return NextResponse.json({ error: "用户已删除" }, { status: 401 });
  }
  return NextResponse.json({
    user: {
      ...user,
      role: isAdminEmail(user.email) ? "admin" : user.role,
    },
  });
}

