import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const POSTS = [
  { email: "demo_dev1@aiug.local", title: "用 ComfyUI 生成的一组赛博朋克风格图片", content: "最近调了一套赛博朋克风格的工作流，分享一下效果。用的是 SDXL + ControlNet，加了一些自定义的 LoRA。整体色调偏蓝紫，霓虹灯效果拉满。大家觉得怎么样？", images: ["https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600", "https://images.unsplash.com/photo-1515630278258-407f66498911?w=600", "https://images.unsplash.com/photo-1563089145-599997674d42?w=600"], tags: ["ComfyUI", "赛博朋克", "AI绘画"], likeCount: 89, viewCount: 1200 },
  { email: "demo_dev2@aiug.local", title: "分享一个免费的 AI 抠图方案", content: "试了很多抠图工具，最后发现 SAM2 + 简单的前端界面就够用了。效果比很多收费工具都好，而且完全本地运行。代码已开源。", images: ["https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600"], tags: ["抠图", "SAM2", "开源"], likeCount: 156, viewCount: 2300 },
  { email: "demo_dev3@aiug.local", title: "GPT-4o 的语音功能太强了", content: "刚体验了 GPT-4o 的实时语音对话，延迟低到感觉不到，而且能听出情感变化。试了英语口语练习、模拟面试、讲故事，效果都很好。", images: [], tags: ["GPT-4o", "语音", "体验"], likeCount: 234, viewCount: 3400 },
  { email: "demo_dev4@aiug.local", title: "我用 Cursor 三天写了一个完整的 SaaS", content: "不是标题党，真的三天从零到上线。技术栈：Next.js 14 + Tailwind + Supabase + Stripe + Vercel。Cursor 的 Composer 功能太猛了，基本上描述需求就能生成 80% 的代码。", images: ["https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600", "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600"], tags: ["Cursor", "SaaS", "独立开发"], likeCount: 312, viewCount: 5600 },
  { email: "demo_dev5@aiug.local", title: "AI 学习路线图分享（2024版）", content: "整理了一份 AI 学习路线图，适合零基础入门。从 Python 基础到深度学习再到 LLM 应用开发，每个阶段都附了推荐资源。", images: [], tags: ["学习路线", "入门", "教程"], likeCount: 445, viewCount: 8900 },
  { email: "demo_dev6@aiug.local", title: "Sora 生成的视频效果对比", content: "拿到了 Sora 的测试资格，和 Runway Gen-3、Pika 做了个对比。Sora 画质最好运动最自然但生成慢，Runway 速度快质量中等，Pika 最快但画质一般。", images: ["https://images.unsplash.com/photo-1574158622682-e40e69881006?w=600", "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600"], tags: ["Sora", "视频生成", "对比"], likeCount: 278, viewCount: 4200 },
];

const COMMENTS = [
  "效果不错，能分享一下参数吗？",
  "太强了，收藏了！",
  "请问这个对显卡有什么要求？",
  "学到了，感谢分享",
  "有没有视频教程？想跟着学",
  "这个思路很好，我也试试",
];

export async function POST(req: Request) {
  const secret = req.headers.get("x-seed-secret");
  if (secret !== "aiug-seed-2024-temp") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let created = 0;
  let commentsCreated = 0;

  for (const p of POSTS) {
    const user = await prisma.user.findUnique({ where: { email: p.email } });
    if (!user) continue;
    const existing = await prisma.post.findFirst({ where: { title: p.title, authorId: user.id } });
    if (existing) continue;

    const post = await prisma.post.create({
      data: {
        authorId: user.id, type: "text", status: "published",
        title: p.title, content: p.content,
        images: p.images.length > 0 ? JSON.stringify(p.images) : null,
        cover: p.images[0] || null,
        tags: JSON.stringify(p.tags),
        likeCount: p.likeCount, commentCount: 3, viewCount: p.viewCount,
      },
    });
    created++;

    // Add comments
    const allUsers = await prisma.user.findMany({ where: { email: { startsWith: "demo_dev" } }, take: 6 });
    const commenters = allUsers.filter(u => u.id !== user.id).slice(0, 3);
    const shuffled = [...COMMENTS].sort(() => Math.random() - 0.5);
    for (let i = 0; i < commenters.length; i++) {
      await prisma.comment.create({ data: { postId: post.id, authorId: commenters[i].id, content: shuffled[i] } });
      commentsCreated++;
    }
  }

  return NextResponse.json({ ok: true, posts: created, comments: commentsCreated });
}

