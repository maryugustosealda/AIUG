"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CircleEditor() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ slug: "", name: "", icon: "", description: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr("");
    const r = await fetch("/api/admin/circles", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setBusy(false);
    if (!r.ok) { const d = await r.json(); setErr(d.error || "失败"); return; }
    setOpen(false);
    setForm({ slug: "", name: "", icon: "", description: "" });
    router.refresh();
  }

  if (!open) return <button onClick={() => setOpen(true)} className="btn-primary">+ 新建圈子</button>;
  return (
    <form onSubmit={submit} className="card p-4 space-y-3">
      <div className="grid gap-3 md:grid-cols-2">
        <div><label className="label">slug(英文,作为 URL)</label><input className="input" required value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></div>
        <div><label className="label">名称</label><input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
        <div><label className="label">图标(emoji)</label><input className="input" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="🎨" /></div>
        <div><label className="label">描述</label><input className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
      </div>
      {err && <div className="text-sm text-rose-600">{err}</div>}
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={() => setOpen(false)} className="btn-outline">取消</button>
        <button className="btn-primary" disabled={busy}>{busy ? "..." : "创建"}</button>
      </div>
    </form>
  );
}

