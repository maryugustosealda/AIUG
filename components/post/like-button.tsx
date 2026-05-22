"use client";
import { Heart } from "lucide-react";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LikeButton({
  postId,
  initial,
  liked: likedInit,
  size = "sm",
}: {
  postId: string;
  initial: number;
  liked: boolean;
  size?: "sm" | "md";
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const [count, setCount] = useState(initial);
  const [liked, setLiked] = useState(likedInit);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    if (!session) {
      router.push("/login");
      return;
    }
    if (busy) return;
    setBusy(true);
    const next = !liked;
    setLiked(next);
    setCount((c) => c + (next ? 1 : -1));
    const r = await fetch(`/api/posts/${postId}/like`, { method: next ? "POST" : "DELETE" });
    if (!r.ok) {
      setLiked(!next);
      setCount((c) => c + (next ? -1 : 1));
    }
    setBusy(false);
  }

  return (
    <button
      onClick={toggle}
      className={`flex items-center gap-1 transition ${liked ? "text-rose-500" : "hover:text-brand-600"} ${size === "md" ? "text-base" : "text-sm"}`}
    >
      <Heart className={`${size === "md" ? "h-5 w-5" : "h-4 w-4"} ${liked ? "fill-current" : ""}`} />
      {count}
    </button>
  );
}

