"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function MeSignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="btn-ghost w-full border border-[rgb(var(--border))] text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
    >
      <LogOut className="h-4 w-4" /> 退出登录
    </button>
  );
}