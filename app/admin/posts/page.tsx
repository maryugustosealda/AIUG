import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { fromNow } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminPostsPage({ searchParams }: { searchParams: { status?: string } }) {
  const where: any = {};
  if (searchParams.status) where.status = searchParams.status;
  const list = await prisma.post.findMany({
    where, orderBy: { createdAt: "desc" }, take: 200,
    include: { author: { select: { username: true, nickname: true } } },
  });
  const filters = ["", "published", "pending", "rejected", "removed"];
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">所有内容</h1>
      <div className="flex gap-2">
        {filters.map((f) => (
          <Link key={f || "all"} href={f ? `/admin/posts?status=${f}` : "/admin/posts"}
            className={`chip ${(searchParams.status || "") === f ? "bg-brand-600 text-white" : ""}`}>
            {f || "全部"}
          </Link>
        ))}
      </div>
      <div className="card divide-y divide-[rgb(var(--border))]">
        {list.map((p) => (
          <div key={p.id} className="flex items-center gap-3 p-3 text-sm">
            <span className="chip">{p.type}</span>
            <span className="chip">{p.status}</span>
            <Link href={p.type === "app" ? `/apps/${p.id}` : `/post/${p.id}`} className="flex-1 truncate hover:text-brand-600">{p.title}</Link>
            <span className="text-xs text-[rgb(var(--muted))]">@{p.author.username} · {fromNow(p.createdAt)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

