import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { fromNow, safeJSON } from "@/lib/utils";
import ReviewActions from "@/components/admin/review-actions";

export const dynamic = "force-dynamic";

export default async function ReviewPage() {
  const list = await prisma.post.findMany({
    where: { status: "pending" },
    orderBy: { createdAt: "asc" },
    include: {
      author: { select: { username: true, nickname: true, email: true } },
      app: { include: { category: true } },
      service: true,
    },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">待审核 ({list.length})</h1>
      {list.length === 0 && <div className="card p-12 text-center text-[rgb(var(--muted))]">没有待审核的内容</div>}
      <div className="space-y-4">
        {list.map((p) => {
          const platforms = p.app ? safeJSON<string[]>(p.app.platforms, []) : [];
          return (
            <div key={p.id} className="card p-5">
              <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-[rgb(var(--muted))]">
                <span className="chip">{p.type === "app" ? "应用" : p.type === "service" ? "技能" : p.type}</span>
                <span>由 <Link href={`/u/${p.author.username}`} className="link">{p.author.nickname}</Link> ({p.author.email}) 提交</span>
                <span>· {fromNow(p.createdAt)}</span>
              </div>

              {p.type === "app" && p.app && (
                <div className="mb-4 rounded-lg bg-[rgb(var(--hover))] p-4">
                  <div className="flex items-start gap-3">
                    {p.app.logo ? <img src={p.app.logo} alt="" className="h-14 w-14 rounded-lg" /> : <div className="grid h-14 w-14 place-items-center rounded-lg bg-brand-200 font-bold">{p.app.name.slice(0,1)}</div>}
                    <div className="flex-1">
                      <div className="font-semibold">{p.app.name} <span className="text-xs text-[rgb(var(--muted))]">v{p.app.version}</span></div>
                      <div className="text-sm text-[rgb(var(--muted))]">{p.app.summary}</div>
                      <div className="mt-1 flex flex-wrap gap-1 text-xs">
                        <span className="chip">{p.app.category.name}</span>
                        {platforms.map((x) => <span key={x} className="chip">{x}</span>)}
                        <span className="chip">{p.app.pricingMode === "paid" ? `¥${p.app.price}` : p.app.pricingMode}</span>
                        {p.app.size && <span className="chip">{p.app.size}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 break-all text-sm">
                    <span className="text-[rgb(var(--muted))]">夸克链接:</span>
                    <a href={p.app.downloadUrl} target="_blank" rel="noreferrer" className="link ml-1">{p.app.downloadUrl}</a>
                    {p.app.downloadPwd && <span className="ml-2">提取码 <code className="rounded bg-[rgb(var(--card))] px-1.5 py-0.5">{p.app.downloadPwd}</code></span>}
                  </div>
                </div>
              )}

              {p.type === "service" && p.service && (
                <div className="mb-4 rounded-lg bg-[rgb(var(--hover))] p-4">
                  <div className="text-xs text-[rgb(var(--muted))]">技能服务 · {p.service.category}</div>
                  <div className="mt-1 text-sm">{p.service.summary}</div>
                  <div className="mt-3 space-y-2">
                    <div className="text-xs text-[rgb(var(--muted))]">套餐 ({safeJSON<any[]>(p.service.packages, []).length})</div>
                    <div className="space-y-1 text-xs">
                      {safeJSON<any[]>(p.service.packages, []).map((pkg: any, i: number) => (
                        <div key={i} className="rounded bg-[rgb(var(--card))] p-2">
                          <span className="font-medium">{pkg.name}</span>
                          <span className="ml-2 text-brand-600 font-semibold">{pkg.price > 0 ? `¥${pkg.price}` : "面议"}</span>
                          {pkg.deliveryDays > 0 && <span className="ml-2 text-[rgb(var(--muted))]">{pkg.deliveryDays} 天</span>}
                          <div className="mt-0.5 text-[rgb(var(--muted))]">交付:{pkg.deliverables}</div>
                        </div>
                      ))}
                    </div>
                    {p.service.contactInfo && (
                      <details className="text-xs">
                        <summary className="cursor-pointer text-[rgb(var(--muted))]">联系方式</summary>
                        <pre className="mt-1 max-h-40 overflow-auto whitespace-pre-wrap rounded bg-[rgb(var(--card))] p-2">{p.service.contactInfo}</pre>
                      </details>
                    )}
                  </div>
                </div>
              )}

              <h3 className="font-semibold">{p.title}</h3>
              <pre className="mt-2 max-h-60 overflow-auto whitespace-pre-wrap rounded bg-[rgb(var(--hover))] p-3 text-xs">{p.content}</pre>

              <ReviewActions postId={p.id} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

