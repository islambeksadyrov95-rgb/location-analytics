"use client";

import { useState, useCallback, useRef } from "react";

export function PhotoCarousel({ photos }: { photos: string[] }) {
  const [idx, setIdx] = useState(0);
  const startX = useRef<number | null>(null);

  const prev = useCallback(
    () => setIdx((p) => (p - 1 + photos.length) % photos.length),
    [photos.length],
  );
  const next = useCallback(
    () => setIdx((p) => (p + 1) % photos.length),
    [photos.length],
  );

  if (!photos || !photos.length)
    return (
      <div className="h-[180px] bg-[#1e1e2a] flex items-center justify-center text-[#4b5563] text-sm">
        Нет фото
      </div>
    );

  return (
    <div
      className="relative h-[200px] overflow-hidden select-none"
      onTouchStart={(e) => {
        startX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (startX.current === null) return;
        const diff = e.changedTouches[0].clientX - startX.current;
        if (Math.abs(diff) > 40) {
          if (diff < 0) next();
          else prev();
        }
        startX.current = null;
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={photos[idx]}
        src={photos[idx]}
        alt={`Фото ${idx + 1}`}
        className="w-full h-[200px] object-cover"
        draggable={false}
      />
      {photos.length > 1 && (
        <>
          {/* Dots */}
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {photos.map((_, i) => (
              <button
                key={i}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setIdx(i);
                }}
                className={`rounded-full border-none cursor-pointer transition-all ${
                  i === idx ? "w-5 h-2.5 bg-[#fbbf24]" : "w-2.5 h-2.5 bg-white/50"
                }`}
              />
            ))}
          </div>
          {/* Prev */}
          <button
            onPointerDown={(e) => {
              e.stopPropagation();
              e.preventDefault();
              prev();
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 border-none text-white w-9 h-9 rounded-full cursor-pointer text-lg flex items-center justify-center z-10"
          >
            ‹
          </button>
          {/* Next */}
          <button
            onPointerDown={(e) => {
              e.stopPropagation();
              e.preventDefault();
              next();
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 border-none text-white w-9 h-9 rounded-full cursor-pointer text-lg flex items-center justify-center z-10"
          >
            ›
          </button>
        </>
      )}
      <div className="absolute top-2 left-2 bg-black/60 rounded-md px-2 py-0.5 text-[10px] text-[#d1d5db] z-10">
        {idx + 1}/{photos.length}
      </div>
    </div>
  );
}
