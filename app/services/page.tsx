import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { fromNow, safeJSON } from "@/lib/utils";
import { Briefcase, Clock, Package } from "lucide-react";

export const dynamic = "force-dynamic";

const CATEGORY_LABEL: Record<string, string> = {
  teaching: "教学/课程", consulting: "咨询答疑", customize: "定制开发",
  outsource: "代做服务", training: "训练/微调",
};

const CATEGORIES = [
  { v: "", label: "全部" },
  { v: "teaching", label: "教学/课程" },
  { v: "consulting", label: "咨询答疑" },
  { v: "customize", label: "定制开发" },
  { v: "outsource", label: "代做服务" },
  { v: "training", label: "训练/微调" },
];

type Pkg = { name: string; price: number; deliveryDays: number; deliverables: string };

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: { cat?: string };
}) {
  const cat = searchParams.cat || "";
  const services = await prisma.service.findMany({
    where: {
      ...(cat ? { category: cat } : {}),
      post: { status: "published" },
    },
    orderBy: { createdAt: "desc" },
    include: {
      post: {
        select: {
          id: true, title: true, viewCount: true, likeCount: true, createdAt: true,
          author: { select: { id: true, username: true, nickname: true, avatar: true } },
        },
      },
    },
    take: 60,
  });

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="flex items-center gap-2">
          <Briefcase className="h-6 w-6 text-brand-600" />
          <h1 className="text-2xl font-bold">技能市场</h1>
        </div>
        <p className="mt-1 text-sm text-[rgb(var(--muted))]">
          找人帮你 AI 出片、做视频、训练模型,或者上架你自己的技能。
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {CATEGORIES.map((c) => (
            <Link key={c.v} href={c.v ? `/services?cat=${c.v}` : "/services"}
              className={`chip ${cat === c.v ? "bg-brand-600 text-white" : "hover:bg-brand-100 dark:hover:bg-brand-900/40"}`}>
              {c.label}
            </Link>
          ))}
          <Link href="/post/new?type=service" className="btn-primary ml-auto">
            <Briefcase className="h-4 w-4" /> 上架我的技能
          </Link>
        </div>
      </div>

      {services.length === 0 ? (
        <div className="card p-12 text-center text-[rgb(var(--muted))]">
          这个分类下还没有人发布技能,
          <Link href="/post/new?type=service" className="link">来当第一个</Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => {
            const samples = safeJSON<string[]>(s.workSamples, []);
            const cover = samples[0];
            const pkgs = safeJSON<Pkg[]>(s.packages, []);
            const minPrice = pkgs.reduce((m, p) => (p.price > 0 && (m === 0 || p.price < m) ? p.price : m), 0);
            return (
              <Link key={s.id} href={`/services/${s.post.id}`}
                className="card overflow-hidden transition hover:border-brand-300 dark:hover:border-brand-700">
                <div className="aspect-video overflow-hidden bg-gradient-to-br from-brand-500/15 to-brand-800/15">
                  {cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={cover} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="grid h-full place-items-center text-4xl font-bold text-brand-700/40">
                      <Briefcase className="h-12 w-12" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <span className="chip text-xs">{CATEGORY_LABEL[s.category] || s.category}</span>
                  <h3 className="mt-2 font-semibold leading-snug line-clamp-2">{s.post.title}</h3>
                  <p className="mt-1 line-clamp-2 text-xs text-[rgb(var(--muted))]">{s.summary}</p>
                  <div className="mt-3 flex items-center justify-between border-t border-[rgb(var(--border))] pt-3">
                    <div className="flex items-center gap-2 text-xs text-[rgb(var(--muted))]">
                      {s.post.author.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={s.post.author.avatar} alt="" className="h-5 w-5 rounded-full" />
                      ) : (
                        <div className="grid h-5 w-5 place-items-center rounded-full bg-brand-100 text-brand-700 text-[10px]">{s.post.author.nickname.slice(0, 1)}</div>
                      )}
                      <span>{s.post.author.nickname}</span>
                    </div>
                    <div className="text-right">
                      {minPrice > 0 ? (
                        <div className="text-xs"><span className="text-[rgb(var(--muted))]">起</span> <span className="text-base font-bold text-brand-600">¥{minPrice}</span></div>
                      ) : (
                        <span className="text-xs text-[rgb(var(--muted))]">面议</span>
                      )}
                      <div className="text-[10px] text-[rgb(var(--muted))]">
                        <Package className="inline h-3 w-3" /> {pkgs.length} 套餐
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

