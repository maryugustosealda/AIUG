"use client";
import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="mx-auto mt-12 max-w-sm card p-6">加载中...</div>}>
      <LoginInner />
    </Suspense>
  );
}

function LoginInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr("");
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.ok) {
      router.push(sp.get("callbackUrl") || "/");
      router.refresh();
    } else {
      setErr("邮箱或密码错误");
    }
  }

  return (
    <div className="mx-auto mt-12 max-w-sm">
      <div className="card p-6">
        <h1 className="mb-1 text-2xl font-bold">登录</h1>
        <p className="mb-6 text-sm text-[rgb(var(--muted))]">回到 AIUG 创作者社区</p>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="label">邮箱</label>
            <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="label">密码</label>
            <input className="input" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {err && <div className="rounded bg-red-500/10 p-2 text-sm text-red-600">{err}</div>}
          <button className="btn-primary w-full" disabled={loading}>
            {loading ? "登录中..." : "登录"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-[rgb(var(--muted))]">
          还没账号? <Link href="/register" className="link">立即注册</Link>
        </p>
      </div>
    </div>
  );
}

