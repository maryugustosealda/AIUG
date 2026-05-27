"use client";
import { useState } from "react";
import { Bookmark } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function FavoriteButton({
  postId,
  initial,
  size = "sm",
}: {
  postId: string;
  initial: boolean;
  size?: "sm" | "md";
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const [faved, setFaved] = useState(initial);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    if (!session?.user) {
      router.push("/login");
      return;
    }
    setLoading(true);
    setFaved(!faved);
    try {
      await fetch(`/api/posts/${postId}/favorite`, { method: "POST" });
    } catch {
      setFaved(faved);
    }
    setLoading(false);
  };

  const cls = size === "md" ? "h-5 w-5" : "h-4 w-4";

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`flex items-center gap-1 transition-colors ${
        faved ? "text-amber-500" : "text-[rgb(var(--muted))] hover:text-amber-500"
      }`}
      title={faved ? "取消收藏" : "收藏"}
    >
      <Bookmark className={cls} fill={faved ? "currentColor" : "none"} />
      <span className="text-sm">{faved ? "已收藏" : "收藏"}</span>
    </button>
  );
}

