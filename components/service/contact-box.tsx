"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Lock, Eye, MessageCircle } from "lucide-react";
import Markdown from "@/components/markdown";

const CHANNEL_LABEL: Record<string, string> = {
  wechat: "微信支付", alipay: "支付宝", afdian: "爱发电", patreon: "Patreon",
  xianyu: "闲鱼", taobao: "淘宝店铺", starstation: "知识星球", contact: "联系作者",
};

export default function ServiceContactBox({
  paymentChannels, contactInfo,
}: {
  paymentChannels: string[];
  contactInfo: string | null;
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--hover))]/40 p-4">
      <div className="flex items-center gap-2 text-sm font-medium">
        <MessageCircle className="h-4 w-4" /> 联系作者下单
      </div>

      {paymentChannels.length > 0 && (
        <div className="mt-3">
          <div className="text-xs text-[rgb(var(--muted))]">支持的付款方式</div>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {paymentChannels.map((c) => <span key={c} className="chip">{CHANNEL_LABEL[c] || c}</span>)}
          </div>
        </div>
      )}

      {contactInfo ? (
        !session ? (
          <div className="mt-3 rounded-md border border-dashed border-[rgb(var(--border))] p-3 text-center text-sm text-[rgb(var(--muted))]">
            <Lock className="mx-auto mb-1 h-4 w-4" />
            登录后查看联系方式
            <button onClick={() => router.push("/login")} className="btn-primary mt-2 w-full">去登录</button>
          </div>
        ) : !revealed ? (
          <button onClick={() => setRevealed(true)} className="btn-primary mt-3 w-full">
            <Eye className="h-4 w-4" /> 查看联系方式
          </button>
        ) : (
          <div className="prose prose-sm dark:prose-invert mt-3 rounded-md bg-[rgb(var(--card))] p-3 text-sm">
            <Markdown content={contactInfo} />
          </div>
        )
      ) : (
        <p className="mt-3 text-xs text-[rgb(var(--muted))]">作者未填写联系方式,可在评论区留言或私信作者。</p>
      )}
    </div>
  );
}

