import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { makeBadge } from "@/lib/badge";

export const dynamic = "force-dynamic";

/**
 * 一键导入基础数据(圈子)
 * - 仅管理员可用
 * - 幂等:重复调用不会重建已有 slug 的圈子,只补缺
 */

const CIRCLES = [
  { slug: "ai-painting",  name: "AI 绘画",     description: "Stable Diffusion / Midjourney / ComfyUI 玩家集合", icon: "palette",  color: "violet"  },
  { slug: "writing",      name: "AI 写作",     description: "提示词、润色、长文创作经验交流",                       icon: "pen",      color: "rose"    },
  { slug: "coding",       name: "AI 编程",     description: "Cursor、Copilot、Claude Code 实战与吐槽",            icon: "code",     color: "indigo"  },
  { slug: "agents",       name: "智能体",      description: "Agent、自动化、工具调用与 MCP 玩法",                   icon: "bot",      color: "cyan"    },
  { slug: "video-audio",  name: "音视频",      description: "AI 配音、剪辑、Sora / Runway 等视频模型",              icon: "music",    color: "amber"   },
  { slug: "model-tools",  name: "模型工具",    description: "本地大模型、量化、微调、推理框架",                     icon: "cpu",      color: "emerald" },
  { slug: "study",        name: "学习交流",    description: "教程、读书笔记、新手提问",                             icon: "book",     color: "sky"     },
  { slug: "showcase",     name: "作品展示",    description: "晒成果,看大家最近做的酷东西",                         icon: "sparkles", color: "fuchsia" },
];

export async function POST() {
  let admin;
  try {
    admin = await requireAdmin();
  } catch (e: any) {
    if (e?.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }
    return NextResponse.json({ error: "仅管理员可执行" }, { status: 403 });
  }

  // 圈子(幂等)
  const created: string[] = [];
  const skipped: string[] = [];
  for (const c of CIRCLES) {
    const existing = await prisma.circle.findUnique({ where: { slug: c.slug } });
    if (existing) {
      skipped.push(c.slug);
      continue;
    }
    await prisma.circle.create({
      data: {
        slug: c.slug,
        name: c.name,
        description: c.description,
        icon: makeBadge(c.icon as any, c.color as any),
      },
    });
    created.push(c.slug);
  }

  return NextResponse.json({
    ok: true,
    circles: { created, skipped },
    room: { created: false, renamed: false, id: null, name: "" },
  });
}

