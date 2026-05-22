import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CreateRoomButton from "@/components/chat/create-room-button";
import { fromNow } from "@/lib/utils";
import { Users, Hash } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ChatHome() {
  const session = await auth();
  const userId = session?.user?.id;
  const [publicRooms, joined] = await Promise.all([
    prisma.chatRoom.findMany({
      where: { visibility: "public" },
      orderBy: { lastMsgAt: "desc" },
      take: 30,
    }),
    userId
      ? prisma.chatMember.findMany({
          where: { userId },
          orderBy: { room: { lastMsgAt: "desc" } },
          include: { room: true },
        })
      : Promise.resolve([]),
  ]);

  return (
    <div className="grid gap-6 md:grid-cols-[260px_1fr]">
      <aside className="space-y-4">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold">聊天群组</h1>
          <CreateRoomButton />
        </div>
        {userId && (
          <div className="card p-3">
            <h3 className="mb-2 text-xs font-medium text-[rgb(var(--muted))]">我加入的</h3>
            <ul className="space-y-1 text-sm">
              {joined.length === 0 && <li className="text-[rgb(var(--muted))] text-xs px-2">还没加入任何群</li>}
              {joined.map((m) => (
                <li key={m.id}>
                  <Link href={`/chat/${m.room.id}`} className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-[rgb(var(--hover))]">
                    <span className="grid h-7 w-7 place-items-center rounded-md bg-brand-100 text-brand-700">{m.room.icon || "#"}</span>
                    <span className="flex-1 truncate">{m.room.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </aside>

      <div>
        <h2 className="mb-3 flex items-center gap-1 text-lg font-semibold"><Hash className="h-5 w-5" />公开群组</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {publicRooms.map((r) => (
            <Link key={r.id} href={`/chat/${r.id}`} className="card p-4 hover:border-brand-300 dark:hover:border-brand-700 transition-colors">
              <div className="flex items-start gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-700 text-white text-xl">{r.icon || r.name.slice(0,1)}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{r.name}</div>
                  <p className="line-clamp-2 mt-0.5 text-sm text-[rgb(var(--muted))]">{r.description || "—"}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-[rgb(var(--muted))]">
                <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {r.memberCount} 人</span>
                <span>活跃于 {fromNow(r.lastMsgAt)}</span>
              </div>
            </Link>
          ))}
          {publicRooms.length === 0 && (
            <div className="card col-span-full p-12 text-center text-[rgb(var(--muted))]">
              还没有公开群组,
              {userId ? <span className="link cursor-pointer">点击右上角 + 创建一个</span> : <Link href="/login" className="link">登录</Link>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

