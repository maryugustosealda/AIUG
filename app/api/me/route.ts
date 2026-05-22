import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

const Schema = z.object({
  nickname: z.string().min(1).max(20).optional(),
  avatar: z.string().max(500).optional().nullable(),
  bio: z.string().max(200).optional().nullable(),
});

export async function PATCH(req: Request) {
  let user; try { user = await requireUser(); } catch { return NextResponse.json({ error: "请先登录" }, { status: 401 }); }
  try {
    const data = Schema.parse(await req.json());
    await prisma.user.update({ where: { id: user.id }, data });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e?.issues) return NextResponse.json({ error: e.issues[0]?.message }, { status: 400 });
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

