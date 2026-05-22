"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Plus } from "lucide-react";
import BadgeIcon, { BadgePicker } from "@/components/badge-icon";
import { makeBadge, type ColorKey, type IconKey } from "@/lib/badge";

export default function CreateRoomButton() {
  const { data: session } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [iconKey, setIconKey] = useState<IconKey>("chat");
  const [colorKey, setColorKey] = useState<ColorKey>("indigo");
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  // 仅管理员可创建群组
  if (!session || (session.user as any)?.role !== "admin") return null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr("");
    const r = await fetch("/api/chat/rooms", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, icon: makeBadge(iconKey, colorKey), visibility }),
    });
    setBusy(false);
    if (!r.ok) { const d = await r.json(); setErr(d.error || "创建失败"); return; }
    const d = await r.json();
    setOpen(false);
    router.push(`/chat/${d.room.id}`);
    router.refresh();
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-ghost px-2" title="创建群组">
        <Plus className="h-4 w-4" />
      </button>
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={() => setOpen(false)}>
          <form onClick={(e) => e.stopPropagation()} onSubmit={submit} className="card w-full max-w-md p-6 space-y-4">
            <div className="flex items-center gap-3">
              <BadgeIcon raw={makeBadge(iconKey, colorKey)} size="lg" />
              <div className="flex-1">
                <h2 className="text-lg font-bold">创建群组</h2>
                <div className="text-xs text-foreground/60">仅管理员可创建</div>
              </div>
            </div>
            <div>
              <label className="label">名称</label>
              <input className="input" required maxLength={30} value={name} onChange={(e) => setName(e.target.value)} placeholder="例如 ComfyUI 交流群" />
            </div>
            <div>
              <label className="label">简介(可选)</label>
              <input className="input" maxLength={200} value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <BadgePicker iconKey={iconKey} colorKey={colorKey} onChange={({ iconKey: i, colorKey: c }) => { setIconKey(i); setColorKey(c); }} />
            <div>
              <label className="label">可见性</label>
              <select className="input" value={visibility} onChange={(e) => setVisibility(e.target.value as any)}>
                <option value="public">公开(任何人可加入)</option>
                <option value="private">私密(仅邀请加入)</option>
              </select>
            </div>
            {err && <div className="rounded bg-red-500/10 p-2 text-sm text-red-600">{err}</div>}
            <div className="flex justify-end gap-2 pt-1">
              <button type="button" onClick={() => setOpen(false)} className="btn-outline">取消</button>
              <button className="btn-primary" disabled={busy}>{busy ? "..." : "创建"}</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

