import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

const Schema = z.object({ reason: z.string().min(2).max(40), detail: z.string().max(500).optional() });

export async function POST(req: Request, { params }: { params: { id: string } }) {
  let user; try { user = await requireUser(); } catch { return NextResponse.json({ error: "请先登录" }, { status: 401 }); }
  try {
    const data = Schema.parse(await req.json());
    await prisma.report.create({
      data: { reporterId: user.id, postId: params.id, reason: data.reason, detail: data.detail ?? null },
    });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e?.issues) return NextResponse.json({ error: e.issues[0]?.message }, { status: 400 });
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

