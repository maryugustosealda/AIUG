"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ReportActions({ reportId, postId }: { reportId: string; postId?: string | null }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function action(action: "dismiss" | "remove") {
    if (action === "remove" && !confirm("确认下架该内容?")) return;
    setBusy(true);
    await fetch(`/api/admin/reports/${reportId}/${action}`, { method: "POST" });
    setBusy(false);
    router.refresh();
  }
  return (
    <div className="mt-3 flex gap-2">
      <button onClick={() => action("dismiss")} disabled={busy} className="btn-outline">忽略</button>
      {postId && <button onClick={() => action("remove")} disabled={busy} className="btn-outline border-rose-300 text-rose-600">下架内容</button>}
    </div>
  );
}

