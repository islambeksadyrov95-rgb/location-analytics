"use client";

import { useState } from "react";

export function PhotoCarousel({ photos }: { photos: string[] }) {
  const [idx, setIdx] = useState(0);

  if (!photos || !photos.length)
    return (
      <div className="h-[180px] bg-[#1e1e2a] flex items-center justify-center text-[#4b5563] text-sm">
        Нет фото
      </div>
    );

  return (
    <div className="relative h-[200px] overflow-hidden">
      <img
        src={photos[idx]}
        alt=""
        className="w-full h-[200px] object-cover transition-opacity duration-300"
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = "none";
        }}
      />
      {photos.length > 1 && (
        <>
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1.5">
            {photos.map((_, i) => (
              <button
                key={i}
                onClick={(e) => {
                  e.stopPropagation();
                  setIdx(i);
                }}
                className={`h-[7px] rounded-full border-none cursor-pointer transition-all ${
                  i === idx ? "w-4 bg-[#fbbf24]" : "w-[7px] bg-white/40"
                }`}
              />
            ))}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIdx((p) => (p - 1 + photos.length) % photos.length);
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 border-none text-white w-7 h-7 rounded-full cursor-pointer text-sm"
          >
            ‹
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIdx((p) => (p + 1) % photos.length);
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 border-none text-white w-7 h-7 rounded-full cursor-pointer text-sm"
          >
            ›
          </button>
        </>
      )}
      <div className="absolute top-2 left-2 bg-black/60 rounded-md px-2 py-0.5 text-[10px] text-[#d1d5db]">
        {idx + 1}/{photos.length}
      </div>
    </div>
  );
}
