import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { fromNow } from "@/lib/utils";
import ReportActions from "@/components/admin/report-actions";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const list = await prisma.report.findMany({
    where: { status: "open" },
    orderBy: { createdAt: "desc" },
    include: {
      reporter: { select: { username: true, nickname: true } },
      post: { select: { id: true, type: true, title: true, status: true } },
    },
  });
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">举报处理 ({list.length})</h1>
      {list.length === 0 && <div className="card p-12 text-center text-[rgb(var(--muted))]">没有未处理的举报</div>}
      <div className="space-y-3">
        {list.map((r) => (
          <div key={r.id} className="card p-4">
            <div className="flex flex-wrap items-center gap-2 text-xs text-[rgb(var(--muted))]">
              <span className="chip">{r.reason}</span>
              <span>来自 <Link href={`/u/${r.reporter.username}`} className="link">{r.reporter.nickname}</Link></span>
              <span>· {fromNow(r.createdAt)}</span>
            </div>
            {r.detail && <p className="mt-2 text-sm">{r.detail}</p>}
            {r.post && (
              <div className="mt-3 rounded-md bg-[rgb(var(--hover))] p-3 text-sm">
                <span className="chip mr-2">{r.post.type}</span>
                <Link href={r.post.type === "app" ? `/apps/${r.post.id}` : `/post/${r.post.id}`} className="link">{r.post.title}</Link>
                <span className="ml-2 text-xs text-[rgb(var(--muted))]">[{r.post.status}]</span>
              </div>
            )}
            <ReportActions reportId={r.id} postId={r.post?.id} />
          </div>
        ))}
      </div>
    </div>
  );
}

