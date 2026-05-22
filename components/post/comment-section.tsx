"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { fromNow } from "@/lib/utils";

type Comment = {
  id: string;
  content: string;
  createdAt: string;
  author: { id: string; username: string; nickname: string; avatar: string | null };
  replies?: Comment[];
};

export default function CommentSection({ postId }: { postId: string }) {
  const { data: session } = useSession();
  const [list, setList] = useState<Comment[]>([]);
  const [content, setContent] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    const r = await fetch(`/api/posts/${postId}/comments`);
    const d = await r.json();
    setList(d.comments || []);
  }
  useEffect(() => { load(); }, [postId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || busy) return;
    setBusy(true);
    const r = await fetch(`/api/posts/${postId}/comments`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    setBusy(false);
    if (r.ok) { setContent(""); load(); }
  }

  return (
    <section className="card p-5">
      <h3 className="mb-4 font-semibold">评论 ({list.length})</h3>
      {session ? (
        <form onSubmit={submit} className="mb-5">
          <textarea className="input min-h-[80px]" maxLength={2000} placeholder="说点什么..." value={content} onChange={(e) => setContent(e.target.value)} />
          <div className="mt-2 flex justify-end">
            <button className="btn-primary" disabled={busy || !content.trim()}>{busy ? "发送中..." : "发表"}</button>
          </div>
        </form>
      ) : (
        <div className="mb-5 rounded-lg bg-[rgb(var(--hover))] p-3 text-sm">
          <Link href="/login" className="link">登录</Link> 后参与讨论
        </div>
      )}

      <div className="space-y-4">
        {list.length === 0 && <p className="text-sm text-[rgb(var(--muted))]">还没有评论,来抢沙发</p>}
        {list.map((c) => (
          <div key={c.id} className="border-t border-[rgb(var(--border))] pt-3 first:border-0 first:pt-0">
            <div className="flex items-center gap-2 text-sm">
              <Link href={`/u/${c.author.username}`} className="font-medium hover:text-brand-600">{c.author.nickname}</Link>
              <span className="text-xs text-[rgb(var(--muted))]">{fromNow(c.createdAt)}</span>
            </div>
            <p className="mt-1 whitespace-pre-wrap text-sm">{c.content}</p>
            {c.replies && c.replies.length > 0 && (
              <div className="mt-2 space-y-2 rounded-md bg-[rgb(var(--hover))]/50 p-3">
                {c.replies.map((r) => (
                  <div key={r.id} className="text-sm">
                    <Link href={`/u/${r.author.username}`} className="font-medium hover:text-brand-600">{r.author.nickname}</Link>
                    <span className="ml-2 text-xs text-[rgb(var(--muted))]">{fromNow(r.createdAt)}</span>
                    <p className="mt-0.5 whitespace-pre-wrap">{r.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

