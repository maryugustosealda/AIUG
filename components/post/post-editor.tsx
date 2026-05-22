"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, HelpCircle, Package, Upload, Briefcase } from "lucide-react";
import ServiceForm, { ServiceState } from "./service-form";

type Cat = { id: string; name: string };
type Circle = { id: string; slug: string; name: string };
type Type = "text" | "app" | "question" | "service";

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

const BILLING_CYCLES = [
  { v: "oneTime", label: "一次买断" },
  { v: "monthly", label: "按月订阅" },
  { v: "yearly", label: "按年订阅" },
  { v: "lifetime", label: "终身授权" },
];

export default function PostEditor({
  categories,
  circles,
  initialType,
}: {
  categories: Cat[];
  circles: Circle[];
  initialType: Type;
}) {
  const router = useRouter();
  const [type, setType] = useState<Type>(initialType);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [cover, setCover] = useState("");
  const [circleId, setCircleId] = useState("");
  const [tagsRaw, setTagsRaw] = useState("");

  // app 字段
  const [name, setName] = useState("");
  const [logo, setLogo] = useState("");
  const [summary, setSummary] = useState("");
  const [screenshots, setScreenshots] = useState<string[]>([]);
  const [categoryId, setCategoryId] = useState(categories[0]?.id || "");
  const [platforms, setPlatforms] = useState<string[]>(["windows"]);
  const [version, setVersion] = useState("1.0.0");
  const [size, setSize] = useState("");
  const [requirements, setRequirements] = useState("");
  const [pricingMode, setPricingMode] = useState<"free" | "trial" | "paid">("free");
  const [price, setPrice] = useState(0);
  const [billingCycle, setBillingCycle] = useState<"oneTime" | "monthly" | "yearly" | "lifetime">("oneTime");
  const [trialDesc, setTrialDesc] = useState("");
  const [paymentChannels, setPaymentChannels] = useState<string[]>([]);
  const [pricingDetail, setPricingDetail] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [downloadPwd, setDownloadPwd] = useState("");

  // service 字段
  const [service, setService] = useState<ServiceState>({
    category: "teaching",
    summary: "",
    workSamples: [],
    packages: [{ name: "基础版", price: 99, deliveryDays: 3, deliverables: "", description: "" }],
    paymentChannels: [],
    contactInfo: "",
  });

  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  function togglePlatform(p: string) {
    setPlatforms((arr) => (arr.includes(p) ? arr.filter((x) => x !== p) : [...arr, p]));
  }

  function togglePaymentChannel(c: string) {
    setPaymentChannels((arr) => (arr.includes(c) ? arr.filter((x) => x !== c) : [...arr, c]));
  }

  async function uploadImage(file: File): Promise<string | null> {
    const fd = new FormData();
    fd.append("file", file);
    const r = await fetch("/api/upload", { method: "POST", body: fd });
    if (!r.ok) return null;
    const d = await r.json();
    return d.url ?? null;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr("");
    const tags = tagsRaw.split(/[,，\s]+/).map((s) => s.trim()).filter(Boolean).slice(0, 8);
    const body: any = { type, title, content, cover: cover || null, circleId: circleId || null, tags };
    if (type === "app") {
      body.app = {
        name, logo: logo || null, summary,
        screenshots: screenshots.length ? screenshots : undefined,
        categoryId,
        platforms, version, size: size || null,
        requirements: requirements || null,
        pricingMode,
        price: pricingMode === "paid" ? Number(price) : 0,
        billingCycle: pricingMode === "paid" ? billingCycle : null,
        trialDesc: pricingMode === "trial" ? (trialDesc || null) : null,
        paymentChannels: pricingMode !== "free" && paymentChannels.length ? paymentChannels : undefined,
        pricingDetail: pricingMode !== "free" ? (pricingDetail || null) : null,
        downloadUrl, downloadPwd: downloadPwd || null,
      };
    }
    if (type === "service") {
      // 校验:必须至少一个套餐有名称和交付内容
      const validPkgs = service.packages.filter((p) => p.name.trim() && p.deliverables.trim());
      if (validPkgs.length === 0) { setErr("至少填写一个完整的套餐"); setLoading(false); return; }
      body.service = {
        category: service.category,
        summary: service.summary,
        workSamples: service.workSamples.length ? service.workSamples : undefined,
        packages: validPkgs.map((p) => ({
          name: p.name, price: Number(p.price) || 0,
          deliveryDays: Number(p.deliveryDays) || 0,
          deliverables: p.deliverables,
          description: p.description || null,
        })),
        paymentChannels: service.paymentChannels.length ? service.paymentChannels : undefined,
        contactInfo: service.contactInfo || null,
      };
    }
    const r = await fetch("/api/posts", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
    });
    const d = await r.json();
    setLoading(false);
    if (!r.ok) { setErr(d.error || "提交失败"); return; }
    if (d.post.status === "pending") {
      router.push("/me/posts?msg=submitted");
    } else {
      router.push(`/post/${d.post.id}`);
    }
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="card p-2 inline-flex flex-wrap">
        {[
          { v: "text", label: "图文分享", Icon: FileText },
          { v: "app", label: "发布应用", Icon: Package },
          { v: "service", label: "技能服务", Icon: Briefcase },
          { v: "question", label: "提问求助", Icon: HelpCircle },
        ].map(({ v, label, Icon }) => (
          <button
            type="button" key={v} onClick={() => setType(v as Type)}
            className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition ${type === v ? "bg-brand-600 text-white" : "hover:bg-[rgb(var(--hover))]"}`}
          >
            <Icon className="h-4 w-4" /> {label}
          </button>
        ))}
      </div>

      <div className="card p-5 space-y-4">
        <div>
          <label className="label">标题</label>
          <input className="input" required maxLength={120} value={title} onChange={(e) => setTitle(e.target.value)} placeholder={type === "app" ? "应用一句话标题,例如: AI 抠图工具 PicCut 1.0" : "标题"} />
        </div>

        <div>
          <label className="label">正文(支持 Markdown)</label>
          <textarea className="input min-h-[240px] font-mono text-sm" required value={content} onChange={(e) => setContent(e.target.value)} placeholder="**应用介绍**&#10;&#10;- 功能 1&#10;- 功能 2&#10;&#10;## 使用方法&#10;..." />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="label">封面图(可选)</label>
            <div className="flex gap-2">
              <input className="input" value={cover} onChange={(e) => setCover(e.target.value)} placeholder="图片 URL,或下方上传" />
              <label className="btn-outline cursor-pointer">
                <Upload className="h-4 w-4" />
                <input type="file" accept="image/*" hidden onChange={async (e) => { const f = e.target.files?.[0]; if (f) { const u = await uploadImage(f); if (u) setCover(u); } }} />
              </label>
            </div>
            {cover && <img src={cover} alt="" className="mt-2 h-28 rounded-md object-cover" />}
          </div>
          <div>
            <label className="label">圈子(可选)</label>
            <select className="input" value={circleId} onChange={(e) => setCircleId(e.target.value)}>
              <option value="">不指定圈子</option>
              {circles.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="label">标签(空格或逗号分隔,最多 8 个)</label>
          <input className="input" value={tagsRaw} onChange={(e) => setTagsRaw(e.target.value)} placeholder="例如: 抠图 ComfyUI 教程" />
        </div>
      </div>

      {type === "app" && (
        <div className="card p-5 space-y-4">
          <div className="text-sm text-[rgb(var(--muted))]">应用信息(提交后进入审核,审核通过后下载链接将锁定不可修改)</div>
          <div className="grid gap-4 md:grid-cols-[120px_1fr]">
            <div>
              <label className="label">Logo</label>
              <label className="grid h-24 w-24 cursor-pointer place-items-center rounded-xl border border-dashed border-[rgb(var(--border))] hover:bg-[rgb(var(--hover))] overflow-hidden">
                {logo ? <img src={logo} alt="" className="h-full w-full object-cover" /> : <Upload className="h-5 w-5 text-[rgb(var(--muted))]" />}
                <input type="file" accept="image/*" hidden onChange={async (e) => { const f = e.target.files?.[0]; if (f) { const u = await uploadImage(f); if (u) setLogo(u); } }} />
              </label>
            </div>
            <div className="space-y-3">
              <div><label className="label">应用名</label><input className="input" required value={name} onChange={(e) => setName(e.target.value)} /></div>
              <div><label className="label">一句话简介</label><input className="input" required maxLength={160} value={summary} onChange={(e) => setSummary(e.target.value)} /></div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="label">分类</label>
              <select className="input" required value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div><label className="label">版本</label><input className="input" value={version} onChange={(e) => setVersion(e.target.value)} /></div>
            <div><label className="label">大小</label><input className="input" placeholder="120MB" value={size} onChange={(e) => setSize(e.target.value)} /></div>
          </div>

          <div>
            <label className="label">支持平台</label>
            <div className="flex flex-wrap gap-2">
              {["windows", "macos", "linux", "android", "ios", "web"].map((p) => (
                <button type="button" key={p} onClick={() => togglePlatform(p)} className={`chip cursor-pointer ${platforms.includes(p) ? "bg-brand-600 text-white" : ""}`}>{p}</button>
              ))}
            </div>
          </div>

          <div><label className="label">运行要求(可选)</label><input className="input" value={requirements} onChange={(e) => setRequirements(e.target.value)} placeholder="Win10+ / 8GB 内存 / NVIDIA 显卡 6G 以上" /></div>

          <div>
            <label className="label">应用截图(最多 6 张,Steam 风格,展示给用户看)</label>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
              {screenshots.map((url, i) => (
                <div key={i} className="group relative aspect-video overflow-hidden rounded-lg border border-[rgb(var(--border))]">
                  <img src={url} alt="" className="h-full w-full object-cover" />
                  <button type="button" onClick={() => setScreenshots(screenshots.filter((_, j) => j !== i))} className="absolute right-1 top-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white opacity-0 group-hover:opacity-100">删除</button>
                </div>
              ))}
              {screenshots.length < 6 && (
                <label className="grid aspect-video cursor-pointer place-items-center rounded-lg border border-dashed border-[rgb(var(--border))] hover:bg-[rgb(var(--hover))]">
                  <Upload className="h-5 w-5 text-[rgb(var(--muted))]" />
                  <input type="file" accept="image/*" multiple hidden onChange={async (e) => {
                    const files = Array.from(e.target.files || []);
                    const urls: string[] = [];
                    for (const f of files.slice(0, 6 - screenshots.length)) {
                      const u = await uploadImage(f);
                      if (u) urls.push(u);
                    }
                    setScreenshots([...screenshots, ...urls]);
                  }} />
                </label>
              )}
            </div>
          </div>

          {/* 定价区块 */}
          <div className="rounded-lg border border-[rgb(var(--border))] p-4 space-y-4">
            <div>
              <label className="label">定价方式</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { v: "free", label: "完全免费", desc: "用户无需付费即可使用" },
                  { v: "trial", label: "免费试用", desc: "可试用,完整功能需付费" },
                  { v: "paid", label: "付费应用", desc: "下载即需付费,或下载试用版" },
                ].map((m) => (
                  <button
                    type="button"
                    key={m.v}
                    onClick={() => setPricingMode(m.v as any)}
                    className={`rounded-lg border p-3 text-left transition ${pricingMode === m.v ? "border-brand-500 bg-brand-50 dark:bg-brand-900/30" : "border-[rgb(var(--border))] hover:bg-[rgb(var(--hover))]"}`}
                  >
                    <div className="text-sm font-medium">{m.label}</div>
                    <div className="mt-0.5 text-xs text-[rgb(var(--muted))]">{m.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {pricingMode === "trial" && (
              <div>
                <label className="label">试用范围说明</label>
                <input
                  className="input" maxLength={500} value={trialDesc} onChange={(e) => setTrialDesc(e.target.value)}
                  placeholder="例如:试用 7 天 / 每天处理 30 张 / 仅基础功能"
                />
              </div>
            )}

            {pricingMode === "paid" && (
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="label">价格(元)</label>
                  <input className="input" type="number" min={0} step={0.01} value={price} onChange={(e) => setPrice(Number(e.target.value))} />
                </div>
                <div>
                  <label className="label">计费方式</label>
                  <select className="input" value={billingCycle} onChange={(e) => setBillingCycle(e.target.value as any)}>
                    {BILLING_CYCLES.map((c) => <option key={c.v} value={c.v}>{c.label}</option>)}
                  </select>
                </div>
              </div>
            )}

            {pricingMode !== "free" && (
              <>
                <div>
                  <label className="label">付款渠道(可多选,告诉用户怎么付费)</label>
                  <div className="flex flex-wrap gap-2">
                    {PAYMENT_CHANNELS.map((c) => (
                      <button
                        type="button" key={c.v} onClick={() => togglePaymentChannel(c.v)}
                        className={`chip cursor-pointer ${paymentChannels.includes(c.v) ? "bg-brand-600 text-white" : ""}`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="label">详细说明(可选,支持 Markdown)</label>
                  <textarea
                    className="input min-h-[120px] font-mono text-sm" maxLength={2000}
                    value={pricingDetail} onChange={(e) => setPricingDetail(e.target.value)}
                    placeholder={pricingMode === "paid"
                      ? "例如:&#10;微信扫码支付 99 元,备注您的邮箱&#10;支付后 24h 内将激活码发到邮箱&#10;遇到问题加微信 xxxxx"
                      : "例如:&#10;试用 7 天,可处理 30 张图&#10;完整版 49 元一次买断&#10;爱发电赞助 50 元以上即送终身版"}
                  />
                </div>
              </>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
            <div><label className="label">夸克网盘链接</label><input className="input" required value={downloadUrl} onChange={(e) => setDownloadUrl(e.target.value)} placeholder="https://pan.quark.cn/s/xxxxxx" /></div>
            <div><label className="label">提取码(可选)</label><input className="input" value={downloadPwd} onChange={(e) => setDownloadPwd(e.target.value)} placeholder="abc123" /></div>
          </div>
        </div>
      )}

      {type === "service" && (
        <ServiceForm state={service} setState={setService} uploadImage={uploadImage} />
      )}

      {err && <div className="rounded bg-red-500/10 p-3 text-sm text-red-600">{err}</div>}

      <div className="flex justify-end gap-2">
        <button type="button" onClick={() => router.back()} className="btn-outline">取消</button>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "提交中..." : (type === "app" || type === "service") ? "提交审核" : "发布"}
        </button>
      </div>
    </form>
  );
}

