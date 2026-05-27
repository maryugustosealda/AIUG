"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function RouteProgress() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setLoading(false);
    setProgress(100);
    const t = setTimeout(() => setProgress(0), 200);
    return () => clearTimeout(t);
  }, [pathname]);

  useEffect(() => {
    // Intercept link clicks to show progress
    const handleClick = (e: MouseEvent) => {
      const link = (e.target as HTMLElement).closest("a");
      if (!link) return;
      const href = link.getAttribute("href");
      if (!href || href.startsWith("http") || href.startsWith("#")) return;
      if (href === pathname) return;
      setLoading(true);
      setProgress(30);
      // Simulate progress
      const t1 = setTimeout(() => setProgress(60), 300);
      const t2 = setTimeout(() => setProgress(80), 800);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [pathname]);

  if (!loading && progress === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-0.5">
      <div
        className="h-full bg-gradient-to-r from-brand-500 via-cyan-400 to-brand-600 transition-all duration-300 ease-out"
        style={{
          width: `${progress}%`,
          opacity: progress >= 100 ? 0 : 1,
        }}
      />
    </div>
  );
}

