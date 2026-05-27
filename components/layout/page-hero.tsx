import { type ReactNode } from "react";

export function PageHero({
  badge,
  title,
  subtitle,
  actions,
  children,
}: {
  badge?: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="card-tech mb-6 p-6 md:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          {badge && (
            <span className="mb-3 inline-block rounded-full border border-[rgb(var(--accent))]/30 bg-[rgb(var(--accent))]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-[rgb(var(--accent))]">
              {badge}
            </span>
          )}
          <h1 className="page-title bg-gradient-to-r from-[rgb(var(--fg))] via-[rgb(var(--fg))] to-[rgb(var(--muted))] bg-clip-text">
            {title}
          </h1>
          {subtitle && <p className="page-sub">{subtitle}</p>}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
      </div>
      {children}
    </section>
  );
}