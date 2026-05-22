import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fromNow } from "@/lib/utils";
import { Bell, Heart, MessageSquare, UserPlus, Shield } from "lucide-react";

export const dynamic = "force-dynamic";

const Icon = ({ t }: { t: string }) =>
  t === "like" ? <Heart className="h-4 w-4 text-rose-500" /> :
  t === "comment" ? <MessageSquare className="h-4 w-4 text-brand-600" /> :
  t === "follow" ? <UserPlus className="h-4 w-4 text-emerald-600" /> :
  t === "app_review" ? <Shield className="h-4 w-4 text-amber-600" /> :
  <Bell className="h-4 w-4" />;

const text = (t: string) =>
  ({ like: "点赞了你的帖子", comment: "评论了你的帖子", follow: "关注了你", app_review: "应用审核状态变更", system: "系统消息" } as Record<string, string>)[t] || t;

export default async function NotifPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/notifications");
  const list = await prisma.notification.findMany({
    where: { receiverId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { sender: { select: { username: true, nickname: true, avatar: true } } },
  });
  // mark read
  await prisma.notification.updateMany({ where: { receiverId: session.user.id, read: false }, data: { read: true } });
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-4 text-2xl font-bold">通知</h1>
      <div className="card divide-y divide-[rgb(var(--border))]">
        {list.length === 0 && <div className="p-12 text-center text-[rgb(var(--muted))]">暂无通知</div>}
        {list.map((n) => (
          <div key={n.id} className={`flex items-start gap-3 p-4 ${!n.read ? "bg-brand-50/30 dark:bg-brand-900/10" : ""}`}>
            <Icon t={n.type} />
            <div className="flex-1 text-sm">
              <div>
                {n.sender ? (
                  <Link href={`/u/${n.sender.username}`} className="font-medium hover:text-brand-600">{n.sender.nickname}</Link>
                ) : <span className="font-medium">系统</span>}
                <span className="ml-2 text-[rgb(var(--muted))]">{text(n.type)}</span>
              </div>
              {n.content && <p className="mt-1 line-clamp-2 text-[rgb(var(--muted))]">{n.content}</p>}
              <div className="mt-1 flex items-center gap-3 text-xs text-[rgb(var(--muted))]">
                <span>{fromNow(n.createdAt)}</span>
                {n.targetType === "post" && n.targetId && <Link href={`/post/${n.targetId}`} className="link">查看</Link>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

