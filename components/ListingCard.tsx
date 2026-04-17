"use client";

import type { Listing } from "@/lib/types";
import { computeBasicScore, fmt } from "@/lib/scoring";
import { ScoreRing } from "./ScoreRing";
import { PhotoCarousel } from "./PhotoCarousel";

interface Props {
  listing: Listing;
  onSelect: (id: number) => void;
}

export function ListingCard({ listing: l, onSelect }: Props) {
  const score = computeBasicScore(l);

  return (
    <div
      onClick={() => onSelect(l.id)}
      className="bg-[#0f0f18] rounded-[14px] overflow-hidden border border-[#1e1e2a] cursor-pointer mb-2.5 transition-colors hover:border-[#2e2e3a] active:border-[#fbbf24]/30"
    >
      <PhotoCarousel photos={l.photos} />
      <div className="px-3.5 py-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="text-[15px] font-extrabold text-white">
              {l.area} м² · {l.district}
            </div>
            <div className="text-[11px] text-[#6b7280] mt-0.5">{l.address}</div>
          </div>
          <ScoreRing score={score} />
        </div>

        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-xl font-black text-[#fbbf24]">{fmt(l.price)} ₸</span>
          <span className="text-[11px] text-[#6b7280]">
            /мес · {fmt(l.m2)} ₸/м²
          </span>
        </div>

        <div className="flex flex-wrap gap-1 mt-2">
          {[l.propertyType, l.condition, `${l.floor} эт.`, l.entrance].filter(Boolean).map((t, i) => (
            <span
              key={i}
              className="text-[9px] px-[7px] py-0.5 rounded-[5px] bg-[#1e1e2a] text-[#9ca3af]"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
