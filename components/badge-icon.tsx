"use client";
import { COLORS, ICONS, parseBadge, type ColorKey, type IconKey } from "@/lib/badge";
import { cn } from "@/lib/utils";

type Size = "xs" | "sm" | "md" | "lg" | "xl";

const SIZES: Record<Size, { box: string; icon: number; text: string; rounded: string }> = {
  xs: { box: "h-6 w-6",   icon: 12, text: "text-[10px]", rounded: "rounded-md" },
  sm: { box: "h-8 w-8",   icon: 16, text: "text-xs",     rounded: "rounded-lg" },
  md: { box: "h-10 w-10", icon: 20, text: "text-sm",     rounded: "rounded-xl" },
  lg: { box: "h-14 w-14", icon: 28, text: "text-base",   rounded: "rounded-2xl" },
  xl: { box: "h-20 w-20", icon: 40, text: "text-xl",     rounded: "rounded-2xl" },
};

/**
 * 圈子 / 群组 / 分类 通用名牌
 * 优先解析 raw="iconKey:colorKey",失败时根据 seed 稳定 fallback
 */
export default function BadgeIcon({
  raw,
  seed,
  fallbackText,
  size = "md",
  className,
}: {
  raw?: string | null;
  seed?: string;
  fallbackText?: string; // 没有图标时显示首字符
  size?: Size;
  className?: string;
}) {
  const parsed = parseBadge(raw, seed || fallbackText || "");
  const { Icon } = ICONS[parsed.iconKey];
  const color = COLORS[parsed.colorKey];
  const s = SIZES[size];

  return (
    <span
      className={cn(
        "relative inline-flex items-center justify-center bg-gradient-to-br shadow-md",
        color.from,
        color.to,
        s.box,
        s.rounded,
        // 内圈高光 + 外圈轻微描边,确保在浅色和深色主题下都有清晰边界
        "ring-1 ring-inset ring-white/30",
        "outline outline-1 outline-black/5 dark:outline-white/5",
        className
      )}
    >
      <Icon size={s.icon} className="text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)]" strokeWidth={2.5} />
    </span>
  );
}

export function BadgePicker({
  iconKey,
  colorKey,
  onChange,
}: {
  iconKey: IconKey;
  colorKey: ColorKey;
  onChange: (v: { iconKey: IconKey; colorKey: ColorKey }) => void;
}) {
  return (
    <div className="space-y-3">
      <div>
        <div className="label mb-1.5">图标</div>
        <div className="grid grid-cols-7 gap-1.5">
          {(Object.keys(ICONS) as IconKey[]).map((k) => {
            const Icon = ICONS[k].Icon;
            const active = k === iconKey;
            return (
              <button
                type="button"
                key={k}
                onClick={() => onChange({ iconKey: k, colorKey })}
                title={ICONS[k].label}
                className={cn(
                  "grid h-9 w-9 place-items-center rounded-md border transition",
                  active
                    ? "border-indigo-500 bg-indigo-500/10 text-indigo-500"
                    : "border-black/10 text-foreground/70 hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5"
                )}
              >
                <Icon size={16} />
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <div className="label mb-1.5">色调</div>
        <div className="flex flex-wrap gap-1.5">
          {(Object.keys(COLORS) as ColorKey[]).map((k) => {
            const c = COLORS[k];
            const active = k === colorKey;
            return (
              <button
                type="button"
                key={k}
                onClick={() => onChange({ iconKey, colorKey: k })}
                title={c.label}
                aria-label={c.label}
                className={cn(
                  "h-7 w-7 rounded-full bg-gradient-to-br ring-2 transition",
                  c.from,
                  c.to,
                  active ? "ring-foreground" : "ring-transparent hover:ring-foreground/30"
                )}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

