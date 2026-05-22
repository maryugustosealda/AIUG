/**
 * 圈子 / 群组 / 分类 的视觉名牌系统
 *
 * - 旧数据(纯 emoji 或文本)依然能渲染:fallback 到首字母 + 默认色
 * - 新数据强制存为 "iconKey:colorKey",白名单受控
 * - 渲染由 <BadgeIcon /> 组件统一处理,各处看起来一致
 */
import {
  Sparkles,
  Wand2,
  Palette,
  Code2,
  MessagesSquare,
  Cpu,
  Camera,
  BookOpen,
  Music,
  Gamepad2,
  Bot,
  Lightbulb,
  Compass,
  Hammer,
  Coffee,
  Globe,
  Image as ImageIcon,
  Mic,
  PenTool,
  Rocket,
  Brain,
  type LucideIcon,
} from "lucide-react";

export type IconKey =
  | "sparkles" | "wand" | "palette" | "code" | "chat" | "cpu"
  | "camera" | "book" | "music" | "game" | "bot" | "idea"
  | "compass" | "hammer" | "coffee" | "globe" | "image" | "mic"
  | "pen" | "rocket" | "brain";

export type ColorKey =
  | "indigo" | "violet" | "fuchsia" | "rose" | "amber"
  | "emerald" | "cyan" | "sky" | "slate" | "orange";

export const ICONS: Record<IconKey, { label: string; Icon: LucideIcon }> = {
  sparkles: { label: "灵感", Icon: Sparkles },
  wand: { label: "魔法棒", Icon: Wand2 },
  palette: { label: "调色板", Icon: Palette },
  code: { label: "代码", Icon: Code2 },
  chat: { label: "聊天", Icon: MessagesSquare },
  cpu: { label: "算力", Icon: Cpu },
  camera: { label: "镜头", Icon: Camera },
  book: { label: "书本", Icon: BookOpen },
  music: { label: "音乐", Icon: Music },
  game: { label: "游戏", Icon: Gamepad2 },
  bot: { label: "机器人", Icon: Bot },
  idea: { label: "点子", Icon: Lightbulb },
  compass: { label: "罗盘", Icon: Compass },
  hammer: { label: "工具", Icon: Hammer },
  coffee: { label: "咖啡", Icon: Coffee },
  globe: { label: "世界", Icon: Globe },
  image: { label: "图片", Icon: ImageIcon },
  mic: { label: "话筒", Icon: Mic },
  pen: { label: "笔", Icon: PenTool },
  rocket: { label: "火箭", Icon: Rocket },
  brain: { label: "大脑", Icon: Brain },
};

/**
 * 色调:渐变背景 + 高对比文字
 * gradient: tailwind from/to,bg/border 给非渐变退化场景
 */
export const COLORS: Record<
  ColorKey,
  { label: string; from: string; to: string; ring: string; soft: string }
> = {
  indigo:   { label: "靛蓝", from: "from-indigo-500",   to: "to-indigo-700",   ring: "ring-indigo-500/30",   soft: "bg-indigo-500/10" },
  violet:   { label: "紫罗兰", from: "from-violet-500", to: "to-violet-700",   ring: "ring-violet-500/30",   soft: "bg-violet-500/10" },
  fuchsia:  { label: "品红", from: "from-fuchsia-500",  to: "to-fuchsia-700",  ring: "ring-fuchsia-500/30",  soft: "bg-fuchsia-500/10" },
  rose:     { label: "玫红", from: "from-rose-500",     to: "to-rose-700",     ring: "ring-rose-500/30",     soft: "bg-rose-500/10" },
  amber:    { label: "琥珀", from: "from-amber-500",    to: "to-amber-700",    ring: "ring-amber-500/30",    soft: "bg-amber-500/10" },
  emerald:  { label: "翡翠", from: "from-emerald-500",  to: "to-emerald-700",  ring: "ring-emerald-500/30",  soft: "bg-emerald-500/10" },
  cyan:     { label: "青蓝", from: "from-cyan-500",     to: "to-cyan-700",     ring: "ring-cyan-500/30",     soft: "bg-cyan-500/10" },
  sky:      { label: "天蓝", from: "from-sky-500",      to: "to-sky-700",      ring: "ring-sky-500/30",      soft: "bg-sky-500/10" },
  slate:    { label: "石板", from: "from-slate-500",    to: "to-slate-700",    ring: "ring-slate-500/30",    soft: "bg-slate-500/10" },
  orange:   { label: "橙橘", from: "from-orange-500",   to: "to-orange-700",   ring: "ring-orange-500/30",   soft: "bg-orange-500/10" },
};

export const ICON_KEYS = Object.keys(ICONS) as IconKey[];
export const COLOR_KEYS = Object.keys(COLORS) as ColorKey[];

/**
 * 解析 icon 字段为 { iconKey, colorKey, fallback }
 * 支持:
 *   - "sparkles:violet" 标准格式
 *   - 旧数据(emoji 或纯字符) -> fallback
 */
export function parseBadge(
  raw: string | null | undefined,
  seed: string = ""
): { iconKey: IconKey; colorKey: ColorKey; legacy?: string } {
  if (raw && raw.includes(":")) {
    const [ik, ck] = raw.split(":");
    if (ik in ICONS && ck in COLORS) {
      return { iconKey: ik as IconKey, colorKey: ck as ColorKey };
    }
  }
  // legacy fallback:用 seed 做哈希分配一个稳定的色 + 图标
  const fallbackIcon = pickStable(ICON_KEYS, seed || raw || "x");
  const fallbackColor = pickStable(COLOR_KEYS, seed || raw || "y");
  return { iconKey: fallbackIcon, colorKey: fallbackColor, legacy: raw || undefined };
}

export function makeBadge(iconKey: IconKey, colorKey: ColorKey): string {
  return `${iconKey}:${colorKey}`;
}

function pickStable<T>(arr: T[], key: string): T {
  let h = 0;
  for (let i = 0; i < key.length; i++) {
    h = (h * 31 + key.charCodeAt(i)) | 0;
  }
  return arr[Math.abs(h) % arr.length];
}

