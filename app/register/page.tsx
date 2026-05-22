"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", username: "", nickname: "", password: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr("");
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      setErr(data.error || "注册失败");
      setLoading(false);
      return;
    }
    await signIn("credentials", { email: form.email, password: form.password, redirect: false });
    router.push("/");
    router.refresh();
  }

  return (
    <div className="mx-auto mt-12 max-w-sm">
      <div className="card p-6">
        <h1 className="mb-1 text-2xl font-bold">创建账号</h1>
        <p className="mb-6 text-sm text-[rgb(var(--muted))]">加入 AIUG,分享你的 AI 作品</p>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="label">邮箱</label>
            <input className="input" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="label">用户名(英文,作为主页地址)</label>
            <input className="input" required value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="例如 johnny" />
          </div>
          <div>
            <label className="label">昵称(显示用)</label>
            <input className="input" required value={form.nickname} onChange={(e) => setForm({ ...form, nickname: e.target.value })} />
          </div>
          <div>
            <label className="label">密码</label>
            <input className="input" type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
          {err && <div className="rounded bg-red-500/10 p-2 text-sm text-red-600">{err}</div>}
          <button className="btn-primary w-full" disabled={loading}>
            {loading ? "注册中..." : "注册并登录"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-[rgb(var(--muted))]">
          已有账号? <Link href="/login" className="link">登录</Link>
        </p>
      </div>
    </div>
  );
}

