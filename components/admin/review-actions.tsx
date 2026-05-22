"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ReviewActions({ postId }: { postId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [reason, setReason] = useState("");

  async function approve() {
    if (!confirm("确认通过?通过后下载链接将锁定不可修改。")) return;
    setBusy(true);
    await fetch(`/api/admin/posts/${postId}/approve`, { method: "POST" });
    setBusy(false);
    router.refresh();
  }
  async function reject() {
    if (!reason.trim()) { alert("请填写驳回原因"); return; }
    setBusy(true);
    await fetch(`/api/admin/posts/${postId}/reject`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    });
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[rgb(var(--border))] pt-3">
      <input className="input flex-1 min-w-[200px]" placeholder="驳回原因(驳回时必填)" value={reason} onChange={(e) => setReason(e.target.value)} />
      <button onClick={reject} disabled={busy} className="btn-outline border-rose-300 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20">驳回</button>
      <button onClick={approve} disabled={busy} className="btn-primary">通过</button>
    </div>
  );
}

