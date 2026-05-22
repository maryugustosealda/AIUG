import Link from "next/link";
import { prisma } from "@/lib/prisma";
import CircleEditor from "@/components/admin/circle-editor";

export const dynamic = "force-dynamic";

export default async function AdminCirclesPage() {
  const list = await prisma.circle.findMany({ orderBy: { name: "asc" } });
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">圈子管理</h1>
      <CircleEditor />
      <div className="card divide-y divide-[rgb(var(--border))]">
        {list.map((c) => (
          <div key={c.id} className="flex items-center gap-3 p-3 text-sm">
            <span className="text-2xl">{c.icon || c.name.slice(0, 1)}</span>
            <div className="flex-1">
              <Link href={`/circles/${c.slug}`} className="font-medium hover:text-brand-600">{c.name}</Link>
              <div className="text-xs text-[rgb(var(--muted))]">slug: {c.slug} · {c.postCount} 帖</div>
            </div>
            <span className="text-xs text-[rgb(var(--muted))]">{c.description}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

