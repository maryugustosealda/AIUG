import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const [users, posts, apps, comments, pending, reports] = await Promise.all([
    prisma.user.count(),
    prisma.post.count(),
    prisma.app.count(),
    prisma.comment.count(),
    prisma.post.count({ where: { status: "pending" } }),
    prisma.report.count({ where: { status: "open" } }),
  ]);
  const stats = [
    { label: "用户", v: users },
    { label: "内容", v: posts },
    { label: "应用", v: apps },
    { label: "评论", v: comments },
    { label: "待审核", v: pending, hl: true },
    { label: "未处理举报", v: reports, hl: true },
  ];
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">仪表盘</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className={`card p-5 ${s.hl ? "border-amber-400/40" : ""}`}>
            <div className="text-sm text-[rgb(var(--muted))]">{s.label}</div>
            <div className="mt-2 text-3xl font-bold">{s.v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

