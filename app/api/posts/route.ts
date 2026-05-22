import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

const PackageSchema = z.object({
  name: z.string().min(1).max(40),
  price: z.number().min(0).max(99999),
  deliveryDays: z.number().int().min(0).max(365).default(0),
  deliverables: z.string().min(1).max(500),
  description: z.string().max(500).optional().nullable(),
});

const ServiceSchema = z.object({
  type: z.literal("service"),
  title: z.string().min(2).max(120),
  content: z.string().min(10).max(20000),
  cover: z.string().optional().nullable(),
  circleId: z.string().optional().nullable(),
  tags: z.array(z.string()).max(8).optional(),
  service: z.object({
    category: z.enum(["teaching", "consulting", "customize", "outsource", "training"]),
    summary: z.string().min(2).max(160),
    workSamples: z.array(z.string()).max(8).optional(),
    packages: z.array(PackageSchema).min(1).max(5),
    paymentChannels: z.array(z.string()).max(10).optional(),
    contactInfo: z.string().max(2000).optional().nullable(),
  }),
});

const TextSchema = z.object({
  type: z.enum(["text", "question"]),
  title: z.string().min(2).max(120),
  content: z.string().min(1).max(20000),
  cover: z.string().optional().nullable(),
  circleId: z.string().optional().nullable(),
  tags: z.array(z.string()).max(8).optional(),
});

const AppSchema = z.object({
  type: z.literal("app"),
  title: z.string().min(2).max(120),
  content: z.string().min(10).max(20000),
  cover: z.string().optional().nullable(),
  circleId: z.string().optional().nullable(),
  tags: z.array(z.string()).max(8).optional(),
  app: z.object({
    name: z.string().min(1).max(60),
    logo: z.string().optional().nullable(),
    summary: z.string().min(2).max(160),
    screenshots: z.array(z.string()).max(6).optional(),
    categoryId: z.string().min(1),
    platforms: z.array(z.string()).min(1).max(8),
    version: z.string().max(30).default("1.0.0"),
    size: z.string().max(20).optional().nullable(),
    requirements: z.string().max(500).optional().nullable(),
    pricingMode: z.enum(["free", "trial", "paid"]),
    price: z.number().min(0).max(9999).default(0),
    billingCycle: z.enum(["oneTime", "monthly", "yearly", "lifetime"]).optional().nullable(),
    trialDesc: z.string().max(500).optional().nullable(),
    paymentChannels: z.array(z.string()).max(10).optional(),
    pricingDetail: z.string().max(2000).optional().nullable(),
    downloadUrl: z.string().url("夸克链接格式不正确"),
    downloadPwd: z.string().max(20).optional().nullable(),
  }),
});

export async function POST(req: Request) {
  let user;
  try {
    user = await requireUser();
  } catch {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const json = await req.json();
  try {
    if (json.type === "app") {
      const data = AppSchema.parse(json);
      // 校验夸克链接
      if (!/quark\.cn|pan\.quark\.cn/.test(data.app.downloadUrl)) {
        return NextResponse.json({ error: "下载链接必须是夸克网盘链接" }, { status: 400 });
      }
      const post = await prisma.post.create({
        data: {
          authorId: user.id,
          type: "app",
          title: data.title,
          content: data.content,
          cover: data.cover ?? null,
          circleId: data.circleId || null,
          tags: data.tags ? JSON.stringify(data.tags) : null,
          status: "pending", // 应用必须审核
          app: {
            create: {
              name: data.app.name,
              logo: data.app.logo ?? null,
              summary: data.app.summary,
              screenshots: data.app.screenshots && data.app.screenshots.length ? JSON.stringify(data.app.screenshots) : null,
              categoryId: data.app.categoryId,
              platforms: JSON.stringify(data.app.platforms),
              version: data.app.version,
              size: data.app.size ?? null,
              requirements: data.app.requirements ?? null,
              pricingMode: data.app.pricingMode,
              price: data.app.pricingMode === "paid" ? data.app.price : 0,
              billingCycle: data.app.pricingMode === "paid" ? (data.app.billingCycle ?? "oneTime") : null,
              trialDesc: data.app.trialDesc ?? null,
              paymentChannels: data.app.paymentChannels && data.app.paymentChannels.length ? JSON.stringify(data.app.paymentChannels) : null,
              pricingDetail: data.app.pricingDetail ?? null,
              downloadUrl: data.app.downloadUrl,
              downloadPwd: data.app.downloadPwd ?? null,
              linkLocked: false,
            },
          },
        },
        select: { id: true, status: true },
      });
      return NextResponse.json({ post });
    } else if (json.type === "service") {
      const data = ServiceSchema.parse(json);
      const post = await prisma.post.create({
        data: {
          authorId: user.id,
          type: "service",
          title: data.title,
          content: data.content,
          cover: data.cover ?? null,
          circleId: data.circleId || null,
          tags: data.tags ? JSON.stringify(data.tags) : null,
          status: "pending", // 服务包含金额和联系方式,需审核
          service: {
            create: {
              category: data.service.category,
              summary: data.service.summary,
              workSamples: data.service.workSamples && data.service.workSamples.length ? JSON.stringify(data.service.workSamples) : null,
              packages: JSON.stringify(data.service.packages),
              paymentChannels: data.service.paymentChannels && data.service.paymentChannels.length ? JSON.stringify(data.service.paymentChannels) : null,
              contactInfo: data.service.contactInfo ?? null,
            },
          },
        },
        select: { id: true, status: true },
      });
      return NextResponse.json({ post });
    } else {
      const data = TextSchema.parse(json);
      const post = await prisma.post.create({
        data: {
          authorId: user.id,
          type: data.type,
          title: data.title,
          content: data.content,
          cover: data.cover ?? null,
          circleId: data.circleId || null,
          tags: data.tags ? JSON.stringify(data.tags) : null,
          status: "published",
        },
        select: { id: true, status: true },
      });
      return NextResponse.json({ post });
    }
  } catch (e: any) {
    if (e?.issues) {
      return NextResponse.json({ error: e.issues[0]?.message ?? "参数错误" }, { status: 400 });
    }
    return NextResponse.json({ error: e.message ?? "发布失败" }, { status: 500 });
  }
}

