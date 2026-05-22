import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { fromNow } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const list = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    select: { id: true, email: true, username: true, nickname: true, role: true, createdAt: true, _count: { select: { posts: true } } },
  });
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">用户 ({list.length})</h1>
      <div className="card divide-y divide-[rgb(var(--border))]">
        {list.map((u) => (
          <div key={u.id} className="flex items-center gap-3 p-3 text-sm">
            <Link href={`/u/${u.username}`} className="font-medium hover:text-brand-600">{u.nickname}</Link>
            <span className="text-[rgb(var(--muted))]">@{u.username}</span>
            <span className="text-xs text-[rgb(var(--muted))]">{u.email}</span>
            {u.role === "admin" && <span className="chip bg-amber-500/10 text-amber-700">admin</span>}
            <span className="ml-auto text-xs text-[rgb(var(--muted))]">{u._count.posts} 帖 · {fromNow(u.createdAt)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

