import Link from "next/link";
import { prisma } from "@/lib/prisma";
import BadgeIcon from "@/components/badge-icon";
import { COLORS, parseBadge } from "@/lib/badge";

export const dynamic = "force-dynamic";

export default async function CirclesPage() {
  const circles = await prisma.circle.findMany({ orderBy: [{ postCount: "desc" }, { name: "asc" }] });
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">圈子</h1>
        <p className="text-sm text-[rgb(var(--muted))]">按兴趣加入,看到更对味的内容</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {circles.map((c) => {
          const { colorKey } = parseBadge(c.icon, c.slug);
          const tone = COLORS[colorKey];
          return (
            <Link key={c.id} href={`/circles/${c.slug}`} className="card overflow-hidden transition hover:border-brand-300 dark:hover:border-brand-700">
              <div className={`h-20 bg-gradient-to-br ${tone.from} ${tone.to} opacity-90`} />
              <div className="p-4">
                <div className="flex items-center gap-3">
                  <div className="-mt-10">
                    <BadgeIcon raw={c.icon} seed={c.slug} size="lg" className="ring-2 ring-[rgb(var(--card))]" />
                  </div>
                  <h3 className="font-semibold">{c.name}</h3>
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-[rgb(var(--muted))]">{c.description || "—"}</p>
                <div className="mt-2 text-xs text-[rgb(var(--muted))]">{c.postCount} 帖 · {c.memberCount} 成员</div>
              </div>
            </Link>
          );
        })}
        {circles.length === 0 && <div className="card col-span-full p-12 text-center text-[rgb(var(--muted))]">暂无圈子</div>}
      </div>
    </div>
  );
}

