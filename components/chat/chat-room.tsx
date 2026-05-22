"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Send, LogOut, LogIn } from "lucide-react";
import { fromNow } from "@/lib/utils";

type Msg = {
  id: string;
  type: string;
  content: string;
  createdAt: string;
  author: { id: string; username: string; nickname: string; avatar: string | null };
};

export default function ChatRoom({
  roomId, initialMessages, isMember: initIsMember, isPublic, isLoggedIn, currentUserId,
}: {
  roomId: string;
  initialMessages: Msg[];
  isMember: boolean;
  isPublic: boolean;
  isLoggedIn: boolean;
  currentUserId: string;
}) {
  const [messages, setMessages] = useState<Msg[]>(initialMessages);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [isMember, setIsMember] = useState(initIsMember);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastIdRef = useRef<string | null>(initialMessages[initialMessages.length - 1]?.id || null);

  function scrollToBottom() {
    requestAnimationFrame(() => {
      const el = scrollRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    });
  }
  useEffect(() => { scrollToBottom(); }, []);

  // 短轮询拉增量
  useEffect(() => {
    let stopped = false;
    async function tick() {
      if (stopped) return;
      try {
        const after = lastIdRef.current ? `?after=${lastIdRef.current}` : "";
        const r = await fetch(`/api/chat/rooms/${roomId}/messages${after}`);
        if (r.ok) {
          const d = await r.json();
          if (d.messages?.length) {
            setMessages((prev) => [...prev, ...d.messages]);
            lastIdRef.current = d.messages[d.messages.length - 1].id;
            scrollToBottom();
          }
        }
      } catch {}
      if (!stopped) setTimeout(tick, 2000);
    }
    setTimeout(tick, 2000);
    return () => { stopped = true; };
  }, [roomId]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const content = text.trim();
    if (!content || busy) return;
    setBusy(true);
    const r = await fetch(`/api/chat/rooms/${roomId}/messages`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    setBusy(false);
    if (r.ok) {
      const d = await r.json();
      setMessages((prev) => [...prev, d.message]);
      lastIdRef.current = d.message.id;
      setText("");
      setIsMember(true);
      scrollToBottom();
    } else {
      const d = await r.json();
      alert(d.error || "发送失败");
    }
  }

  async function joinOrLeave(action: "join" | "leave") {
    const r = await fetch(`/api/chat/rooms/${roomId}/join`, { method: action === "join" ? "POST" : "DELETE" });
    if (r.ok) setIsMember(action === "join");
    else { const d = await r.json(); alert(d.error || "操作失败"); }
  }

  return (
    <>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <p className="py-12 text-center text-sm text-[rgb(var(--muted))]">这里很安静,说点什么吧</p>
        )}
        {messages.map((m) => {
          if (m.type === "system") {
            return <p key={m.id} className="text-center text-xs text-[rgb(var(--muted))]">— {m.content} —</p>;
          }
          const mine = m.author.id === currentUserId;
          return (
            <div key={m.id} className={`flex gap-2 ${mine ? "flex-row-reverse" : ""}`}>
              <Link href={`/u/${m.author.username}`} className="shrink-0">
                {m.author.avatar ? (
                  <img src={m.author.avatar} alt="" className="h-8 w-8 rounded-full" />
                ) : (
                  <div className="grid h-8 w-8 place-items-center rounded-full bg-brand-100 text-brand-700 text-xs font-medium">{m.author.nickname.slice(0,1)}</div>
                )}
              </Link>
              <div className={`flex max-w-[75%] flex-col ${mine ? "items-end" : "items-start"}`}>
                <div className="flex items-center gap-1 text-xs text-[rgb(var(--muted))]">
                  <span>{m.author.nickname}</span>
                  <span>·</span>
                  <span>{fromNow(m.createdAt)}</span>
                </div>
                <div className={`mt-1 whitespace-pre-wrap break-words rounded-2xl px-3 py-2 text-sm ${mine ? "bg-brand-600 text-white" : "bg-[rgb(var(--hover))]"}`}>
                  {m.content}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-[rgb(var(--border))] p-3">
        {!isLoggedIn ? (
          <Link href="/login" className="btn-primary w-full"><LogIn className="h-4 w-4" />登录后参与聊天</Link>
        ) : !isMember && !isPublic ? (
          <p className="text-center text-sm text-[rgb(var(--muted))]">私密群组,需要成员邀请</p>
        ) : (
          <form onSubmit={send} className="flex gap-2">
            <input
              className="input flex-1" maxLength={2000} placeholder="说点什么... Enter 发送" value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(e); } }}
            />
            <button className="btn-primary" disabled={busy || !text.trim()}><Send className="h-4 w-4" /></button>
            {isMember && (
              <button type="button" onClick={() => joinOrLeave("leave")} className="btn-ghost px-2" title="退出群组">
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </form>
        )}
      </div>
    </>
  );
}

