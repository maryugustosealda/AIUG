import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signMobileToken } from "@/lib/mobile-token";
import { isAdminEmail } from "@/lib/utils";

export const dynamic = "force-dynamic";

const Schema = z.object({
  email: z.string().email("邮箱格式不正确"),
  username: z.string().regex(/^[a-zA-Z0-9_]{3,20}$/, "用户名 3-20 位字母数字下划线"),
  nickname: z.string().min(1, "请输入昵称").max(20),
  password: z.string().min(6, "密码至少 6 位").max(64),
});

/**
 * 移动端注册:同 web 注册逻辑,但额外返回 token 让用户立刻进入登录态
 */
export async function POST(req: Request) {
  try {
    const body = Schema.parse(await req.json());
    const email = body.email.toLowerCase();

    const exist = await prisma.user.findFirst({
      where: { OR: [{ email }, { username: body.username }] },
    });
    if (exist) {
      return NextResponse.json(
        { error: exist.email === email ? "邮箱已注册" : "用户名已被占用" },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(body.password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        username: body.username,
        nickname: body.nickname,
        passwordHash,
      },
    });

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
    return NextResponse.json({ error: e.message ?? "注册失败" }, { status: 500 });
  }
}

