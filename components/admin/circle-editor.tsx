"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import BadgeIcon, { BadgePicker } from "@/components/badge-icon";
import { makeBadge, type ColorKey, type IconKey } from "@/lib/badge";

export default function CircleEditor() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ slug: "", name: "", description: "" });
  const [iconKey, setIconKey] = useState<IconKey>("sparkles");
  const [colorKey, setColorKey] = useState<ColorKey>("violet");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    const r = await fetch("/api/admin/circles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, icon: makeBadge(iconKey, colorKey) }),
    });
    setBusy(false);
    if (!r.ok) {
      const d = await r.json();
      setErr(d.error || "失败");
      return;
    }
    setOpen(false);
    setForm({ slug: "", name: "", description: "" });
    setIconKey("sparkles");
    setColorKey("violet");
    router.refresh();
  }

  if (!open)
    return (
      <button onClick={() => setOpen(true)} className="btn-primary">
        + 新建圈子
      </button>
    );

  return (
    <form onSubmit={submit} className="card space-y-4 p-4">
      <div className="flex items-center gap-3">
        <BadgeIcon raw={makeBadge(iconKey, colorKey)} size="lg" />
        <div className="flex-1">
          <h3 className="text-base font-semibold">新建圈子</h3>
          <div className="text-xs text-foreground/60">仅管理员可创建</div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label className="label">slug(英文,作为 URL)</label>
          <input
            className="input"
            required
            pattern="[a-z0-9\-]+"
            placeholder="ai-painting"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
          />
        </div>
        <div>
          <label className="label">名称</label>
          <input
            className="input"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div className="md:col-span-2">
          <label className="label">描述</label>
          <input
            className="input"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
      </div>

      <BadgePicker
        iconKey={iconKey}
        colorKey={colorKey}
        onChange={({ iconKey: i, colorKey: c }) => {
          setIconKey(i);
          setColorKey(c);
        }}
      />

      {err && <div className="text-sm text-rose-600">{err}</div>}
      <div className="flex justify-end gap-2">
        <button type="button" onClick={() => setOpen(false)} className="btn-outline">
          取消
        </button>
        <button className="btn-primary" disabled={busy}>
          {busy ? "..." : "创建"}
        </button>
      </div>
    </form>
  );
}

