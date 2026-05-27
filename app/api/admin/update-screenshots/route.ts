import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * 仅更新已有应用的截图（轻量操作）
 * POST /api/admin/update-screenshots
 */
const SCREENSHOTS: Record<string, string[]> = {
  "ComfyUI 整合包": ["https://images.unsplash.com/photo-1686191128892-3b37add4c844?w=600", "https://images.unsplash.com/photo-1697577418970-95d99b5a55cf?w=600", "https://images.unsplash.com/photo-1684779847639-fbcc5a57dfe9?w=600"],
  "AI 证件照": ["https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600", "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600", "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600"],
  "AI 配音大师": ["https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600", "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=600"],
  "Prompt 管理器": ["https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600", "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600", "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=600"],
  "AI 思维导图": ["https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=600", "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600"],
  "AI 字幕助手": ["https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600", "https://images.unsplash.com/photo-1536240478700-b869070f9279?w=600", "https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?w=600"],
};

export async function POST(req: Request) {
  const secret = req.headers.get("x-seed-secret");
  if (secret !== "aiug-seed-2024-temp") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let updated = 0;
  for (const [name, shots] of Object.entries(SCREENSHOTS)) {
    const app = await prisma.app.findFirst({ where: { name } });
    if (!app) continue;
    await prisma.app.update({
      where: { id: app.id },
      data: { screenshots: JSON.stringify(shots) },
    });
    updated++;
  }

  return NextResponse.json({ ok: true, updated });
}

