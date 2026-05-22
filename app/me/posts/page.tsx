import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fromNow } from "@/lib/utils";

export const dynamic = "force-dynamic";

const statusBadge: Record<string, string> = {
  published: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  pending: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  rejected: "bg-rose-500/10 text-rose-700 dark:text-rose-400",
  removed: "bg-gray-500/10 text-gray-600",
};
const statusLabel: Record<string, string> = {
  published: "已发布", pending: "审核中", rejected: "已驳回", removed: "已下架",
};

export default async function MyPostsPage({ searchParams }: { searchParams: { msg?: string } }) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/me/posts");

  const posts = await prisma.post.findMany({
    where: { authorId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { app: { select: { name: true, pricingMode: true, price: true } } },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">我的发布</h1>
      {searchParams.msg === "submitted" && (
        <div className="rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-300">
          应用已提交,审核通过后会出现在首页
        </div>
      )}
      <div className="card divide-y divide-[rgb(var(--border))]">
        {posts.length === 0 && <div className="p-12 text-center text-[rgb(var(--muted))]">还没有发布过内容</div>}
        {posts.map((p) => (
          <div key={p.id} className="flex items-center gap-4 p-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-xs">
                <span className={`rounded px-2 py-0.5 ${statusBadge[p.status]}`}>{statusLabel[p.status] || p.status}</span>
                <span className="chip">{p.type}</span>
                <span className="text-[rgb(var(--muted))]">{fromNow(p.createdAt)}</span>
              </div>
              <Link href={p.type === "app" ? `/apps/${p.id}` : `/post/${p.id}`} className="mt-1 block truncate font-medium hover:text-brand-600">{p.title}</Link>
              {p.rejectReason && <p className="mt-1 text-xs text-rose-600">驳回原因:{p.rejectReason}</p>}
            </div>
            <div className="text-xs text-[rgb(var(--muted))]">
              {p.likeCount} 赞 · {p.commentCount} 评 · {p.viewCount} 阅
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

