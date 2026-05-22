"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function FollowButton({ userId, initial }: { userId: string; initial: boolean }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [following, setFollowing] = useState(initial);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    if (!session) { router.push("/login"); return; }
    if (busy) return;
    setBusy(true);
    const next = !following;
    setFollowing(next);
    const r = await fetch(`/api/users/${userId}/follow`, { method: next ? "POST" : "DELETE" });
    if (!r.ok) setFollowing(!next);
    setBusy(false);
  }

  return (
    <button onClick={toggle} className={following ? "btn-outline" : "btn-primary"} disabled={busy}>
      {following ? "已关注" : "关注"}
    </button>
  );
}

