import { cn } from "@/lib/utils";

/**
 * AIUG Logo
 * 设计:抽象的 "A" 由三个圆点连成,中间一道光,代表创作者节点之间的连接。
 * 用渐变 + 当前主题色,自动适配深浅模式。
 */
export function Logo({
  size = 28,
  withText = false,
  className,
}: {
  size?: number;
  withText?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="AIUG"
        role="img"
      >
        <defs>
          <linearGradient id="aiug-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="55%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#4338ca" />
          </linearGradient>
          <linearGradient id="aiug-spark" x1="20" y1="6" x2="20" y2="34" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.4" />
          </linearGradient>
        </defs>
        {/* 圆角方块底 */}
        <rect x="2" y="2" width="36" height="36" rx="9" fill="url(#aiug-grad)" />
        {/* "A" 字三条腿连接 */}
        <path
          d="M11 30 L20 10 L29 30"
          stroke="url(#aiug-spark)"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M14.5 23 L25.5 23"
          stroke="url(#aiug-spark)"
          strokeWidth="2.4"
          strokeLinecap="round"
          fill="none"
        />
        {/* 三个连接节点 */}
        <circle cx="20" cy="10" r="2.4" fill="#fff" />
        <circle cx="11" cy="30" r="2.4" fill="#fff" />
        <circle cx="29" cy="30" r="2.4" fill="#fff" />
      </svg>
      {withText && (
        <span className="font-bold tracking-tight text-base bg-gradient-to-br from-brand-500 to-brand-800 bg-clip-text text-transparent">
          AIUG
        </span>
      )}
    </span>
  );
}

