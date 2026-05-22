"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Download, Lock, Copy, ExternalLink, CheckCircle2, Info } from "lucide-react";
import { formatPrice, pricingLabel } from "@/lib/utils";
import Markdown from "@/components/markdown";

type App = {
  id: string;
  pricingMode: string;
  price: number;
  billingCycle?: string | null;
  trialDesc: string | null;
  paymentChannels?: string | null;
  pricingDetail?: string | null;
  requirements: string | null;
};

const CYCLE_LABEL: Record<string, string> = {
  oneTime: "一次买断", monthly: "/ 月", yearly: "/ 年", lifetime: "终身",
};
const CHANNEL_LABEL: Record<string, string> = {
  wechat: "微信支付", alipay: "支付宝", afdian: "爱发电", patreon: "Patreon",
  xianyu: "闲鱼", taobao: "淘宝店铺", starstation: "知识星球", contact: "联系作者",
};

export default function UnlockBox({ app, unlocked: unlockedInit }: { app: App; unlocked: boolean }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [unlocked, setUnlocked] = useState(unlockedInit);
  const [link, setLink] = useState<{ url: string; password: string | null } | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [showDetail, setShowDetail] = useState(false);

  let channels: string[] = [];
  try { channels = app.paymentChannels ? JSON.parse(app.paymentChannels) : []; } catch {}

  async function getLink() {
    if (!session) { router.push("/login"); return; }
    if (busy) return;
    setBusy(true);
    setErr("");
    const r = await fetch(`/api/apps/${app.id}/unlock`, { method: "POST" });
    const d = await r.json();
    setBusy(false);
    if (!r.ok) { setErr(d.error || "获取链接失败"); return; }
    setUnlocked(true);
    setLink(d.link);
  }

  function copy(text: string) { navigator.clipboard?.writeText(text); }

  const cycleLabel = app.billingCycle && CYCLE_LABEL[app.billingCycle];
  const isFree = app.pricingMode === "free";

  return (
    <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--hover))]/40 p-4">
      <div className="flex items-center gap-3">
        <span className={`rounded-md px-2.5 py-1 text-xs font-medium ${
          app.pricingMode === "free" ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" :
          app.pricingMode === "trial" ? "bg-amber-500/10 text-amber-700 dark:text-amber-400" :
          "bg-brand-500/10 text-brand-700 dark:text-brand-400"
        }`}>{pricingLabel(app.pricingMode)}</span>
        {app.pricingMode === "paid" ? (
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-semibold">{formatPrice(app.price)}</span>
            {cycleLabel && (cycleLabel.startsWith("/") ? <span className="text-sm text-[rgb(var(--muted))]">{cycleLabel}</span> : <span className="chip text-[10px]">{cycleLabel}</span>)}
          </div>
        ) : (
          <div className="text-sm text-[rgb(var(--muted))]">{isFree ? "无需付费" : "试用免费,完整版需付费"}</div>
        )}
      </div>

      {app.trialDesc && app.pricingMode === "trial" && (
        <p className="mt-2 text-sm">
          <span className="text-[rgb(var(--muted))]">试用范围:</span>
          {app.trialDesc}
        </p>
      )}

      {/* 付款渠道 */}
      {!isFree && channels.length > 0 && (
        <div className="mt-3">
          <div className="text-xs text-[rgb(var(--muted))]">付款方式</div>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {channels.map((c) => <span key={c} className="chip">{CHANNEL_LABEL[c] || c}</span>)}
          </div>
        </div>
      )}

      {/* 详细说明 */}
      {!isFree && app.pricingDetail && (
        <div className="mt-3">
          <button type="button" onClick={() => setShowDetail((s) => !s)} className="inline-flex items-center gap-1 text-xs text-brand-600 hover:underline">
            <Info className="h-3 w-3" /> {showDetail ? "收起" : "查看"}付费/试用说明
          </button>
          {showDetail && (
            <div className="prose prose-sm dark:prose-invert mt-2 rounded-md bg-[rgb(var(--card))] p-3 text-sm">
              <Markdown content={app.pricingDetail} />
            </div>
          )}
        </div>
      )}

      {!link && !unlocked && (
        <button onClick={getLink} disabled={busy} className="btn-primary mt-3 w-full md:w-auto">
          {app.pricingMode === "paid" ? <Lock className="h-4 w-4" /> : <Download className="h-4 w-4" />}
          {app.pricingMode === "paid" ? "我已付款,获取下载" : app.pricingMode === "trial" ? "下载试用版" : "获取夸克网盘链接"}
        </button>
      )}

      {(link || unlocked) && (
        <div className="mt-3 space-y-2">
          {!link && unlocked && (
            <button onClick={getLink} className="btn-outline w-full md:w-auto">查看下载链接</button>
          )}
          {link && (
            <>
              <div className="flex items-center gap-2 text-sm text-emerald-600">
                <CheckCircle2 className="h-4 w-4" /> 已解锁,链接如下
              </div>
              <div className="flex flex-wrap items-center gap-2 rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-2 text-sm">
                <a href={link.url} target="_blank" rel="noreferrer" className="link break-all">{link.url}</a>
                <button onClick={() => copy(link.url)} className="btn-ghost px-2 py-1 ml-auto"><Copy className="h-3.5 w-3.5" /></button>
                <a href={link.url} target="_blank" rel="noreferrer" className="btn-primary px-2.5 py-1"><ExternalLink className="h-3.5 w-3.5" /> 打开</a>
              </div>
              {link.password && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-[rgb(var(--muted))]">提取码:</span>
                  <code className="rounded bg-[rgb(var(--hover))] px-2 py-0.5">{link.password}</code>
                  <button onClick={() => copy(link.password!)} className="btn-ghost px-2 py-1"><Copy className="h-3.5 w-3.5" /></button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {err && <div className="mt-2 rounded bg-red-500/10 p-2 text-sm text-red-600">{err}</div>}
    </div>
  );
}

