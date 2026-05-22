import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function fromNow(date: Date | string) {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: zhCN });
}

export function safeJSON<T>(s: string | null | undefined, fallback: T): T {
  if (!s) return fallback;
  try {
    return JSON.parse(s) as T;
  } catch {
    return fallback;
  }
}

export function isAdminEmail(email?: string | null) {
  if (!email) return false;
  const list = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return list.includes(email.toLowerCase());
}

export function formatPrice(p: number) {
  if (!p) return "免费";
  return `¥${p.toFixed(2)}`;
}

export function pricingLabel(mode: string) {
  return { free: "免费", trial: "试用", paid: "付费" }[mode] ?? mode;
}

