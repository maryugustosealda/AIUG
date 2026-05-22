import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

const Schema = z.object({
  slug: z.string().regex(/^[a-z0-9-]{2,30}$/, "slug 仅允许小写字母数字横线"),
  name: z.string().min(1).max(30),
  icon: z.string().max(8).optional().nullable(),
  description: z.string().max(200).optional().nullable(),
});

export async function POST(req: Request) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "无权限" }, { status: 403 }); }
  try {
    const data = Schema.parse(await req.json());
    const c = await prisma.circle.create({
      data: { slug: data.slug, name: data.name, icon: data.icon || null, description: data.description || null },
    });
    return NextResponse.json({ circle: c });
  } catch (e: any) {
    if (e?.code === "P2002") return NextResponse.json({ error: "slug 已存在" }, { status: 400 });
    if (e?.issues) return NextResponse.json({ error: e.issues[0]?.message }, { status: 400 });
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

