import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signMobileToken } from "@/lib/mobile-token";
import { isAdminEmail } from "@/lib/utils";

export const dynamic = "force-dynamic";

const Schema = z.object({
  email: z.string().email("邮箱格式不正确"),
  password: z.string().min(1, "请输入密码"),
});

/**
 * 移动端登录:邮箱 + 密码 -> 返回 30 天 JWT 和当前用户信息
 */
export async function POST(req: Request) {
  try {
    const body = Schema.parse(await req.json());
    const email = body.email.toLowerCase();

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "邮箱或密码错误" }, { status: 401 });
    }
    const ok = await bcrypt.compare(body.password, user.passwordHash);
    if (!ok) {
      return NextResponse.json({ error: "邮箱或密码错误" }, { status: 401 });
    }

    const role = isAdminEmail(user.email) ? "admin" : user.role;
    const token = await signMobileToken({
      uid: user.id,
      email: user.email,
      username: user.username,
      role,
    });

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        nickname: user.nickname,
        avatar: user.avatar,
        role,
      },
    });
  } catch (e: any) {
    if (e?.issues) {
      return NextResponse.json({ error: e.issues[0]?.message ?? "参数错误" }, { status: 400 });
    }
    return NextResponse.json({ error: e.message ?? "登录失败" }, { status: 500 });
  }
}

