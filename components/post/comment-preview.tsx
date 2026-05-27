"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { MessageSquare, Send } from "lucide-react";
import Link from "next/link";

type Comment = {
  id: string;
  content: string;
  createdAt: string;
  author: { nickname: string; avatar: string | null };
};

export default function CommentPreview({
  postId,
  comments,
  total,
  href,
}: {
  postId: string;
  comments: Comment[];
  total: number;
  href: string;
}) {
  const { data: session } = useSession();
  const [input, setInput] = useState("");
  const [list, setList] = useState(comments);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending) return;
    if (!session?.user) {
      window.location.href = "/login";
      return;
    }
    setSending(true);
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: input.trim() }),
      });
      if (res.ok) {
        const newComment = await res.json();
        setList((prev) => [...prev, {
          id: newComment.id,
          content: input.trim(),
          createdAt: new Date().toISOString(),
          author: { nickname: (session.user as any).nickname || session.user.name || "我", avatar: null },
        }]);
        setInput("");
      }
    } catch {}
    setSending(false);
  };

  return (
    <div className="border-t border-[rgb(var(--border))]/50 px-5 py-3 space-y-2">
      {/* 评论列表预览 */}
      {list.length > 0 && (
        <div className="space-y-1.5">
          {list.slice(-3).map((c) => (
            <div key={c.id} className="flex items-start gap-2 text-xs">
              <span className="font-medium text-[rgb(var(--fg))] shrink-0">{c.author.nickname}</span>
              <span className="text-[rgb(var(--muted))] line-clamp-1">{c.content}</span>
            </div>
          ))}
          {total > 3 && (
            <Link href={href} className="text-xs link">
              查看全部 {total} 条评论
            </Link>
          )}
        </div>
      )}

      {/* 快速评论输入框 */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={session?.user ? "写条评论..." : "登录后评论"}
          className="flex-1 rounded-lg border border-[rgb(var(--border))]/60 bg-[rgb(var(--hover))]/50 px-3 py-1.5 text-xs outline-none focus:border-[rgb(var(--accent))]/50 transition"
          disabled={sending}
        />
        <button
          type="submit"
          disabled={!input.trim() || sending}
          className="grid h-7 w-7 place-items-center rounded-lg bg-brand-600/80 text-white disabled:opacity-30 transition hover:bg-brand-500"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </form>
    </div>
  );
}

