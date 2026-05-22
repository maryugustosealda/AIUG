import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ChatRoom from "@/components/chat/chat-room";
import BadgeIcon from "@/components/badge-icon";
import { ArrowLeft, Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ChatRoomPage({ params }: { params: { id: string } }) {
  const session = await auth();
  const room = await prisma.chatRoom.findUnique({
    where: { id: params.id },
    include: { creator: { select: { username: true, nickname: true } } },
  });
  if (!room) return notFound();

  const isMember = session?.user
    ? !!(await prisma.chatMember.findUnique({
        where: { roomId_userId: { roomId: room.id, userId: session.user.id } },
      }))
    : false;

  if (room.visibility === "private" && !isMember) return notFound();

  // 初始消息(转换 Date -> string 给客户端组件)
  const raw = await prisma.chatMessage.findMany({
    where: { roomId: room.id },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { author: { select: { id: true, username: true, nickname: true, avatar: true } } },
  });
  const initial = raw.reverse().map((m) => ({
    id: m.id,
    type: m.type,
    content: m.content,
    createdAt: m.createdAt.toISOString(),
    author: m.author,
  }));

  return (
    <div className="grid h-[calc(100vh-7rem)] gap-4 md:grid-cols-[1fr_240px]">
      <div className="card flex flex-col overflow-hidden">
        <div className="flex items-center gap-3 border-b border-[rgb(var(--border))] p-3">
          <Link href="/chat" className="btn-ghost px-2 md:hidden"><ArrowLeft className="h-4 w-4" /></Link>
          <BadgeIcon raw={room.icon} seed={room.id} size="sm" />
          <div className="flex-1 min-w-0">
            <div className="font-semibold truncate">{room.name}</div>
            <div className="text-xs text-[rgb(var(--muted))]">{room.memberCount} 人 · 由 {room.creator.nickname} 创建</div>
          </div>
        </div>
        <ChatRoom
          roomId={room.id}
          isPublic={room.visibility === "public"}
          initialMessages={initial}
          isMember={isMember}
          isLoggedIn={!!session?.user}
          currentUserId={session?.user?.id || ""}
        />
      </div>
      <aside className="card hidden md:flex flex-col p-3">
        <h3 className="mb-2 flex items-center gap-1 text-sm font-medium"><Users className="h-4 w-4" />成员 ({room.memberCount})</h3>
        <MemberList roomId={room.id} />
      </aside>
    </div>
  );
}

async function MemberList({ roomId }: { roomId: string }) {
  const members = await prisma.chatMember.findMany({
    where: { roomId },
    orderBy: [{ role: "desc" }, { joinedAt: "asc" }],
    take: 50,
    include: { user: { select: { username: true, nickname: true, avatar: true } } },
  });
  return (
    <ul className="space-y-1 overflow-auto text-sm">
      {members.map((m) => (
        <li key={m.id}>
          <Link href={`/u/${m.user.username}`} className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-[rgb(var(--hover))]">
            {m.user.avatar ? (
              <img src={m.user.avatar} alt="" className="h-6 w-6 rounded-full" />
            ) : (
              <div className="grid h-6 w-6 place-items-center rounded-full bg-brand-100 text-brand-700 text-xs">{m.user.nickname.slice(0,1)}</div>
            )}
            <span className="flex-1 truncate">{m.user.nickname}</span>
            {m.role !== "member" && <span className="chip text-[10px]">{m.role}</span>}
          </Link>
        </li>
      ))}
    </ul>
  );
}

