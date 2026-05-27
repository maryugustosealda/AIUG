"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";

export default function SeedPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [err, setErr] = useState("");

  async function run() {
    setLoading(true);
    setErr("");
    setResult(null);
    try {
      const r = await fetch("/api/admin/seed-base", { method: "POST" });
      const d = await r.json();
      if (!r.ok) {
        setErr(d.error || `HTTP ${r.status}`);
      } else {
        setResult(d);
        router.refresh();
      }
    } catch (e: any) {
      setErr(e.message || "网络错误");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">一键导入基础数据</h1>
        <p className="mt-1 text-sm text-foreground/60">
          创建 8 个预设圈子(AI 绘画 / AI 写作 / AI 编程 / 智能体 / 音视频 / 模型工具 / 学习交流 / 作品展示),
          以及 1 个公共群组「AIUG」。
          <br />
          重复点击是安全的:已存在的不会被覆盖。如果之前有过测试群组「AIUG 茶水间」,会自动重命名为「AIUG」。
        </p>
      </div>

      <button
        onClick={run}
        disabled={loading}
        className="btn-primary inline-flex items-center gap-2"
      >
        <Sparkles className="h-4 w-4" />
        {loading ? "导入中..." : "开始导入"}
      </button>

      {err && (
        <div className="card border-rose-300/50 p-4 text-rose-600">
          失败:{err}
        </div>
      )}

      {result && (
        <div className="card space-y-2 p-4 text-sm">
          <div className="font-semibold text-emerald-600">✓ 完成</div>
          <div>
            圈子:新建 {result.circles.created.length} 个
            {result.circles.created.length > 0 && (
              <span className="ml-1 text-foreground/60">
                ({result.circles.created.join(", ")})
              </span>
            )}
            ,跳过 {result.circles.skipped.length} 个
            {result.circles.skipped.length > 0 && (
              <span className="ml-1 text-foreground/60">
                ({result.circles.skipped.join(", ")})
              </span>
            )}
          </div>
          <div className="pt-2 text-xs text-foreground/60">
            前往 <a className="underline" href="/circles">圈子列表</a> 看看效果。
          </div>
        </div>
      )}
    </div>
  );
}

