"use client";

import type { Listing } from "@/lib/types";
import { computeScore, fmt } from "@/lib/scoring";
import { ScoreRing } from "./ScoreRing";
import { PhotoCarousel } from "./PhotoCarousel";

interface Props {
  listing: Listing;
  niche: string;
  onSelect: (id: number) => void;
}

export function ListingCard({ listing: l, niche, onSelect }: Props) {
  const score = computeScore(l, niche);

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
          {[l.propertyType, l.condition, `${l.floor} эт.`].map((t, i) => (
            <span
              key={i}
              className="text-[9px] px-[7px] py-0.5 rounded-[5px] bg-[#1e1e2a] text-[#9ca3af]"
            >
              {t}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-1.5 mt-2.5">
          {[
            {
              v: l.radius.direct.length,
              l: "конкурентов",
              c: l.radius.direct.length <= 2 ? "#34d399" : "#f87171",
            },
            { v: fmt(l.radius.pedestrian.weekday), l: "пешеходов/д", c: "#60a5fa" },
            { v: fmt(l.radius.housing.estPopulation), l: "жителей 1км", c: "#a78bfa" },
          ].map((m, i) => (
            <div key={i} className="bg-[#12121a] rounded-[7px] py-[7px] px-1 text-center">
              <div className="text-[15px] font-black leading-none" style={{ color: m.c }}>
                {m.v}
              </div>
              <div className="text-[8px] text-[#6b7280] mt-0.5">{m.l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
