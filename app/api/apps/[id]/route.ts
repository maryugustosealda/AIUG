import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * 应用详情(精简稳定字段,移动端使用)
 * GET /api/apps/[id]
 */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  let userId: string | null = null;
  try {
    const u = await requireUser();
    userId = u.id;
  } catch {
    userId = null;
  }

  const app = await prisma.app.findUnique({
    where: { id: params.id },
    include: {
      post: {
        select: {
          id: true,
          title: true,
          content: true,
          likeCount: true,
          commentCount: true,
          favoriteCount: true,
          status: true,
          author: {
            select: { id: true, username: true, nickname: true, avatar: true },
          },
        },
      },
      category: { select: { id: true, name: true } },
    },
  });
  if (!app || app.post.status !== "published") {
    return NextResponse.json({ error: "应用不存在或未上架" }, { status: 404 });
  }

  const unlocked = userId
    ? !!(await prisma.unlock.findUnique({
        where: { userId_appId: { userId, appId: app.id } },
      }))
    : false;

  return NextResponse.json({
    app: {
      id: app.id,
      postId: app.postId,
      name: app.name,
      logo: app.logo,
      summary: app.summary,
      screenshots: app.screenshots ? JSON.parse(app.screenshots) : [],
      category: app.category,
      platforms: app.platforms ? JSON.parse(app.platforms) : [],
      version: app.version,
      size: app.size,
      requirements: app.requirements,
      pricingMode: app.pricingMode,
      price: app.price,
      billingCycle: app.billingCycle,
      trialDesc: app.trialDesc,
      paymentChannels: app.paymentChannels ? JSON.parse(app.paymentChannels) : [],
      pricingDetail: app.pricingDetail,
      downloadCount: app.downloadCount,
      createdAt: app.createdAt,
      unlocked,
      post: {
        id: app.post.id,
        title: app.post.title,
        content: app.post.content,
        likeCount: app.post.likeCount,
        commentCount: app.post.commentCount,
        favoriteCount: app.post.favoriteCount,
        author: app.post.author,
      },
    },
  });
}

