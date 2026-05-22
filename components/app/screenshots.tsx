"use client";
import { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export default function Screenshots({ images }: { images: string[] }) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  if (!images.length) return null;

  function prev() {
    setActive((i) => (i - 1 + images.length) % images.length);
  }
  function next() {
    setActive((i) => (i + 1) % images.length);
  }

  return (
    <>
      <div className="space-y-3">
        {/* 主图 */}
        <div className="relative aspect-video overflow-hidden rounded-xl bg-[rgb(var(--hover))]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={images[active]} alt="" className="h-full w-full cursor-zoom-in object-cover" onClick={() => setLightbox(true)} />
          {images.length > 1 && (
            <>
              <button type="button" onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button type="button" onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70">
                <ChevronRight className="h-5 w-5" />
              </button>
              <div className="absolute bottom-2 right-2 rounded bg-black/50 px-2 py-0.5 text-xs text-white">
                {active + 1} / {images.length}
              </div>
            </>
          )}
        </div>
        {/* 缩略图条 */}
        {images.length > 1 && (
          <div className="grid grid-cols-6 gap-2">
            {images.map((src, i) => (
              <button
                type="button"
                key={i}
                onClick={() => setActive(i)}
                className={`relative aspect-video overflow-hidden rounded-md border-2 transition ${i === active ? "border-brand-500" : "border-transparent opacity-70 hover:opacity-100"}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 大图灯箱 */}
      {lightbox && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/90 p-4" onClick={() => setLightbox(false)}>
          <button type="button" className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20" onClick={() => setLightbox(false)}>
            <X className="h-5 w-5" />
          </button>
          {images.length > 1 && (
            <>
              <button type="button" onClick={(e) => { e.stopPropagation(); prev(); }} className="absolute left-4 rounded-full bg-white/10 p-3 text-white hover:bg-white/20">
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button type="button" onClick={(e) => { e.stopPropagation(); next(); }} className="absolute right-4 rounded-full bg-white/10 p-3 text-white hover:bg-white/20">
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={images[active]} alt="" className="max-h-full max-w-full rounded-lg" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </>
  );
}

