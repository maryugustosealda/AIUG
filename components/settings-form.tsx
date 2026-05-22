"use client";
import { useState } from "react";
import { Upload } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SettingsForm({ user }: { user: any }) {
  const router = useRouter();
  const [nickname, setNickname] = useState(user.nickname || "");
  const [avatar, setAvatar] = useState(user.avatar || "");
  const [bio, setBio] = useState(user.bio || "");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function uploadImage(file: File) {
    const fd = new FormData();
    fd.append("file", file);
    const r = await fetch("/api/upload", { method: "POST", body: fd });
    if (!r.ok) return null;
    const d = await r.json();
    return d.url;
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setMsg("");
    const r = await fetch("/api/me", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nickname, avatar, bio }),
    });
    setBusy(false);
    if (r.ok) {
      setMsg("已保存");
      router.refresh();
    } else {
      const d = await r.json();
      setMsg(d.error || "保存失败");
    }
  }

  return (
    <form onSubmit={save} className="card p-6 space-y-4">
      <div>
        <label className="label">邮箱(不可修改)</label>
        <input className="input opacity-60" value={user.email} disabled />
      </div>
      <div>
        <label className="label">用户名(不可修改)</label>
        <input className="input opacity-60" value={user.username} disabled />
      </div>
      <div>
        <label className="label">头像</label>
        <div className="flex items-center gap-3">
          {avatar ? <img src={avatar} alt="" className="h-16 w-16 rounded-full" /> : <div className="grid h-16 w-16 place-items-center rounded-full bg-brand-100 text-brand-700 text-xl font-bold">{nickname.slice(0,1)}</div>}
          <label className="btn-outline cursor-pointer">
            <Upload className="h-4 w-4" /> 上传头像
            <input type="file" accept="image/*" hidden onChange={async (e) => { const f = e.target.files?.[0]; if (f) { const u = await uploadImage(f); if (u) setAvatar(u); } }} />
          </label>
        </div>
      </div>
      <div>
        <label className="label">昵称</label>
        <input className="input" value={nickname} onChange={(e) => setNickname(e.target.value)} maxLength={20} />
      </div>
      <div>
        <label className="label">简介</label>
        <textarea className="input min-h-[80px]" value={bio} onChange={(e) => setBio(e.target.value)} maxLength={200} placeholder="介绍一下自己" />
      </div>
      {msg && <p className="text-sm">{msg}</p>}
      <div className="flex justify-end">
        <button className="btn-primary" disabled={busy}>{busy ? "保存中..." : "保存"}</button>
      </div>
    </form>
  );
}

