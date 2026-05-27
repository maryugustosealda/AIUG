import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fromNow } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function MeLikesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/me/likes");

  const likes = await prisma.like.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      post: {
        select: {
          id: true,
          title: true,
          cover: true,
          likeCount: true,
          commentCount: true,
          createdAt: true,
          status: true,
        },
      },
    },
  });

  const items = likes.map((l) => l.post).filter((p) => p && p.status === "published");

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <div className="flex items-center gap-2">
        <Link href="/me" className="btn-ghost px-2">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-bold">我的点赞</h1>
      </div>
      <ul className="card divide-y divide-[rgb(var(--border))]">
        {items.length === 0 && (
          <li className="p-8 text-center text-sm text-[rgb(var(--muted))]">还没有点赞</li>
        )}
        {items.map((p) => (
          <li key={p!.id}>
            <Link href={`/post/${p!.id}`} className="flex gap-3 p-4 hover:bg-[rgb(var(--hover))]">
              {p!.cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p!.cover} alt="" className="h-14 w-14 rounded-lg object-cover" />
              ) : (
                <div className="h-14 w-14 rounded-lg bg-[rgb(var(--hover))]" />
              )}
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 font-medium">{p!.title || "无标题"}</p>
                <p className="mt-1 text-xs text-[rgb(var(--muted))]">
                  {p!.likeCount} 赞 · {fromNow(p!.createdAt)}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}