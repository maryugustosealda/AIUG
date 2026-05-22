import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { isAdminEmail } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { ReactNode } from "react";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session?.user || !isAdminEmail(session.user.email)) {
    redirect("/");
  }
  const [pendingCount, openReports] = await Promise.all([
    prisma.post.count({ where: { status: "pending" } }),
    prisma.report.count({ where: { status: "open" } }),
  ]);
  return (
    <div className="grid gap-6 md:grid-cols-[200px_1fr]">
      <aside className="card h-fit p-3">
        <div className="mb-3 px-2 text-xs font-medium text-[rgb(var(--muted))]">管理后台</div>
        <nav className="space-y-1 text-sm">
          <Link className="block rounded-md px-3 py-2 hover:bg-[rgb(var(--hover))]" href="/admin">仪表盘</Link>
          <Link className="block rounded-md px-3 py-2 hover:bg-[rgb(var(--hover))]" href="/admin/review">
            待审核 {pendingCount > 0 && <span className="ml-1 rounded bg-amber-500 px-1.5 text-xs text-white">{pendingCount}</span>}
          </Link>
          <Link className="block rounded-md px-3 py-2 hover:bg-[rgb(var(--hover))]" href="/admin/reports">
            举报 {openReports > 0 && <span className="ml-1 rounded bg-rose-500 px-1.5 text-xs text-white">{openReports}</span>}
          </Link>
          <Link className="block rounded-md px-3 py-2 hover:bg-[rgb(var(--hover))]" href="/admin/posts">所有内容</Link>
          <Link className="block rounded-md px-3 py-2 hover:bg-[rgb(var(--hover))]" href="/admin/users">用户</Link>
          <Link className="block rounded-md px-3 py-2 hover:bg-[rgb(var(--hover))]" href="/admin/circles">圈子</Link>
        </nav>
      </aside>
      <div>{children}</div>
    </div>
  );
}

