"use client";
import { useState } from "react";
import { Plus, Upload, X } from "lucide-react";

export type ServiceCategory = "teaching" | "consulting" | "customize" | "outsource" | "training";

export type ServicePackage = {
  name: string;
  price: number;
  deliveryDays: number;
  deliverables: string;
  description?: string;
};

export type ServiceState = {
  category: ServiceCategory;
  summary: string;
  workSamples: string[];
  packages: ServicePackage[];
  paymentChannels: string[];
  contactInfo: string;
};

export const SERVICE_CATEGORIES: { v: ServiceCategory; label: string; desc: string }[] = [
  { v: "teaching", label: "教学/课程", desc: "录播课、直播课、一对一辅导" },
  { v: "consulting", label: "咨询答疑", desc: "技术咨询、方案设计" },
  { v: "customize", label: "定制开发", desc: "按需求开发应用、训练模型" },
  { v: "outsource", label: "代做服务", desc: "代跑工作流、代做视频/图片" },
  { v: "training", label: "训练/微调", desc: "Lora 训练、模型微调" },
];

const PAYMENT_CHANNELS = [
  { v: "wechat", label: "微信支付" },
  { v: "alipay", label: "支付宝" },
  { v: "afdian", label: "爱发电" },
  { v: "patreon", label: "Patreon" },
  { v: "xianyu", label: "闲鱼" },
  { v: "taobao", label: "淘宝店铺" },
  { v: "starstation", label: "知识星球" },
  { v: "contact", label: "联系作者" },
];

const emptyPkg: ServicePackage = { name: "", price: 0, deliveryDays: 3, deliverables: "", description: "" };

export default function ServiceForm({
  state, setState, uploadImage,
}: {
  state: ServiceState;
  setState: (s: ServiceState) => void;
  uploadImage: (f: File) => Promise<string | null>;
}) {
  function patch(p: Partial<ServiceState>) { setState({ ...state, ...p }); }

  function updatePkg(i: number, p: Partial<ServicePackage>) {
    const next = state.packages.map((pkg, idx) => (idx === i ? { ...pkg, ...p } : pkg));
    patch({ packages: next });
  }
  function addPkg() {
    if (state.packages.length >= 5) return;
    patch({ packages: [...state.packages, { ...emptyPkg }] });
  }
  function removePkg(i: number) {
    if (state.packages.length <= 1) return;
    patch({ packages: state.packages.filter((_, idx) => idx !== i) });
  }

  function toggle(arr: string[], v: string) {
    return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
  }

  return (
    <div className="card p-5 space-y-5">
      <div className="text-sm text-[rgb(var(--muted))]">技能信息(发布后所有人可见,联系方式仅登录用户可见)</div>

      <div>
        <label className="label">服务类型</label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {SERVICE_CATEGORIES.map((c) => (
            <button type="button" key={c.v} onClick={() => patch({ category: c.v })}
              className={`rounded-lg border p-2.5 text-left transition ${state.category === c.v ? "border-brand-500 bg-brand-50 dark:bg-brand-900/30" : "border-[rgb(var(--border))] hover:bg-[rgb(var(--hover))]"}`}>
              <div className="text-sm font-medium">{c.label}</div>
              <div className="mt-0.5 text-xs text-[rgb(var(--muted))]">{c.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="label">一句话简介</label>
        <input className="input" required maxLength={160} value={state.summary} onChange={(e) => patch({ summary: e.target.value })} placeholder="例如:教你 7 天上手 ComfyUI,出商业级海报" />
      </div>

      <div>
        <label className="label">作品/案例集(最多 8 张,展示你的实力)</label>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {state.workSamples.map((url, i) => (
            <div key={i} className="group relative aspect-video overflow-hidden rounded-lg border border-[rgb(var(--border))]">
              <img src={url} alt="" className="h-full w-full object-cover" />
              <button type="button" onClick={() => patch({ workSamples: state.workSamples.filter((_, j) => j !== i) })}
                className="absolute right-1 top-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white opacity-0 group-hover:opacity-100">删除</button>
            </div>
          ))}
          {state.workSamples.length < 8 && (
            <label className="grid aspect-video cursor-pointer place-items-center rounded-lg border border-dashed border-[rgb(var(--border))] hover:bg-[rgb(var(--hover))]">
              <Upload className="h-5 w-5 text-[rgb(var(--muted))]" />
              <input type="file" accept="image/*" multiple hidden onChange={async (e) => {
                const files = Array.from(e.target.files || []);
                const urls: string[] = [];
                for (const f of files.slice(0, 8 - state.workSamples.length)) {
                  const u = await uploadImage(f); if (u) urls.push(u);
                }
                patch({ workSamples: [...state.workSamples, ...urls] });
              }} />
            </label>
          )}
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="label !mb-0">服务套餐(至少 1 个,最多 5 个)</label>
          {state.packages.length < 5 && (
            <button type="button" onClick={addPkg} className="btn-ghost text-xs"><Plus className="h-3.5 w-3.5" />新增套餐</button>
          )}
        </div>
        <div className="space-y-3">
          {state.packages.map((pkg, i) => (
            <div key={i} className="rounded-lg border border-[rgb(var(--border))] p-3 space-y-3 relative">
              {state.packages.length > 1 && (
                <button type="button" onClick={() => removePkg(i)} className="absolute right-2 top-2 text-[rgb(var(--muted))] hover:text-red-500"><X className="h-4 w-4" /></button>
              )}
              <div className="grid gap-3 md:grid-cols-[1.4fr_1fr_1fr]">
                <div><label className="label">套餐名称</label><input className="input" required maxLength={40} value={pkg.name} onChange={(e) => updatePkg(i, { name: e.target.value })} placeholder="基础版 / 标准版 / 旗舰版" /></div>
                <div><label className="label">价格(元,0=面议)</label><input className="input" type="number" min={0} step={1} value={pkg.price} onChange={(e) => updatePkg(i, { price: Number(e.target.value) })} /></div>
                <div><label className="label">交付天数</label><input className="input" type="number" min={0} step={1} value={pkg.deliveryDays} onChange={(e) => updatePkg(i, { deliveryDays: Number(e.target.value) })} /></div>
              </div>
              <div><label className="label">交付内容</label><input className="input" required maxLength={500} value={pkg.deliverables} onChange={(e) => updatePkg(i, { deliverables: e.target.value })} placeholder="例如:8 节录播视频 + 1 套素材 + 1 次答疑" /></div>
              <div><label className="label">补充说明(可选)</label><input className="input" maxLength={500} value={pkg.description || ""} onChange={(e) => updatePkg(i, { description: e.target.value })} placeholder="本套餐适合谁,有什么限制" /></div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="label">付款渠道(可多选)</label>
        <div className="flex flex-wrap gap-2">
          {PAYMENT_CHANNELS.map((c) => (
            <button type="button" key={c.v} onClick={() => patch({ paymentChannels: toggle(state.paymentChannels, c.v) })}
              className={`chip cursor-pointer ${state.paymentChannels.includes(c.v) ? "bg-brand-600 text-white" : ""}`}>{c.label}</button>
          ))}
        </div>
      </div>

      <div>
        <label className="label">联系方式说明(支持 Markdown,登录用户可见)</label>
        <textarea className="input min-h-[120px] font-mono text-sm" maxLength={2000} value={state.contactInfo} onChange={(e) => patch({ contactInfo: e.target.value })}
          placeholder={"例如:\n微信:wx_demo123(备注 AIUG 来意)\n下单流程:留言/加微信描述需求 → 报价 → 付款 → 开工\n工作时间 9:00-22:00,周末较慢"} />
      </div>
    </div>
  );
}

