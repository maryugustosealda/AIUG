import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { safeJSON, formatPrice, pricingLabel } from "@/lib/utils";

export const revalidate = 60;

export default async function AppsPage({ searchParams }: { searchParams: { cat?: string; pricing?: string; sort?: string } }) {
  const cats = await prisma.category.findMany({ orderBy: { sort: "asc" } });
  const where: any = { post: { status: "published" } };
  if (searchParams.cat) {
    const c = cats.find((x) => x.slug === searchParams.cat);
    if (c) where.categoryId = c.id;
  }
  if (searchParams.pricing) where.pricingMode = searchParams.pricing;

  const orderBy = searchParams.sort === "hot"
    ? { downloadCount: "desc" as const }
    : { createdAt: "desc" as const };

  const apps = await prisma.app.findMany({
    where, orderBy, take: 60,
    include: {
      category: true,
      post: { select: { id: true, title: true, createdAt: true, viewCount: true, likeCount: true, author: { select: { username: true, nickname: true, avatar: true } } } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">应用市集</h1>
        <p className="text-sm text-[rgb(var(--muted))]">来自创作者的 AI 应用,夸克网盘下载</p>
      </div>

      <div className="card p-4">
        <div className="mb-3 text-xs font-medium text-[rgb(var(--muted))]">分类</div>
        <div className="flex flex-wrap gap-2">
          <Link href="/apps" className={`chip ${!searchParams.cat ? "bg-brand-600 text-white" : ""}`}>全部</Link>
          {cats.map((c) => (
            <Link key={c.id} href={`/apps?cat=${c.slug}`} className={`chip ${searchParams.cat === c.slug ? "bg-brand-600 text-white" : ""}`}>{c.name}</Link>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[rgb(var(--muted))]">定价:</span>
          <Link href={{ query: { ...searchParams, pricing: undefined } }} className={`chip ${!searchParams.pricing ? "bg-brand-600 text-white" : ""}`}>全部</Link>
          <Link href={{ query: { ...searchParams, pricing: "free" } }} className={`chip ${searchParams.pricing === "free" ? "bg-brand-600 text-white" : ""}`}>免费</Link>
          <Link href={{ query: { ...searchParams, pricing: "trial" } }} className={`chip ${searchParams.pricing === "trial" ? "bg-brand-600 text-white" : ""}`}>试用</Link>
          <Link href={{ query: { ...searchParams, pricing: "paid" } }} className={`chip ${searchParams.pricing === "paid" ? "bg-brand-600 text-white" : ""}`}>付费</Link>
          <span className="ml-4 text-[rgb(var(--muted))]">排序:</span>
          <Link href={{ query: { ...searchParams, sort: undefined } }} className={`chip ${!searchParams.sort ? "bg-brand-600 text-white" : ""}`}>最新</Link>
          <Link href={{ query: { ...searchParams, sort: "hot" } }} className={`chip ${searchParams.sort === "hot" ? "bg-brand-600 text-white" : ""}`}>下载量</Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {apps.map((a) => {
          const platforms = safeJSON<string[]>(a.platforms, []);
          const screenshots = safeJSON<string[]>(a.screenshots, []);
          const cover = screenshots[0];
          return (
            <Link key={a.id} href={`/apps/${a.id}`} className="card overflow-hidden transition hover:border-brand-300 dark:hover:border-brand-700">
              {/* 封面图(首张截图)*/}
              <div className="aspect-video overflow-hidden bg-gradient-to-br from-brand-500/15 to-brand-800/15">
                {cover ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={cover} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="grid h-full place-items-center text-4xl font-bold text-brand-700/40">
                    {a.name.slice(0, 1)}
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start gap-3">
                  {a.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={a.logo} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover" />
                  ) : (
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand-100 text-brand-700 text-sm font-semibold">{a.name.slice(0, 1)}</div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-semibold">{a.name}</h3>
                    <p className="line-clamp-1 mt-0.5 text-xs text-[rgb(var(--muted))]">{a.summary}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="chip">{a.category.name}</span>
                  <span className={`font-medium ${a.pricingMode === "paid" ? "text-brand-600" : "text-emerald-600"}`}>
                    {a.pricingMode === "paid" ? formatPrice(a.price) : pricingLabel(a.pricingMode)}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-[rgb(var(--muted))]">
                  <span>{platforms.slice(0, 3).join(" · ") || "—"}</span>
                  <span>{a.downloadCount} 次下载</span>
                </div>
              </div>
            </Link>
          );
        })}
        {apps.length === 0 && (
          <div className="card col-span-full p-12 text-center text-[rgb(var(--muted))]">暂无应用</div>
        )}
      </div>
    </div>
  );
}

