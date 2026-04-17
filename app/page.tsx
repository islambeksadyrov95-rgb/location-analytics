"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { LISTINGS, DISTRICTS, PROPERTY_TYPES, NICHES } from "@/lib/data";
import { computeScore, fmt, fmtN } from "@/lib/scoring";
import { ListingCard } from "@/components/ListingCard";
import { ListingDetail } from "@/components/ListingDetail";

const MapView = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#12121a] rounded-xl flex items-center justify-center text-[#4b5563]">
      Загрузка карты...
    </div>
  ),
});

type Tab = "list" | "map";

export default function Home() {
  const [niche, setNiche] = useState("coffee");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [budget, setBudget] = useState(10000000);
  const [district, setDistrict] = useState("Все");
  const [propType, setPropType] = useState("Все");
  const [sortBy, setSort] = useState("score");
  const [tab, setTab] = useState<Tab>("list");
  const [mapRadius] = useState(1000);

  const filtered = useMemo(() => {
    let items = LISTINGS.filter((l) => l.price <= budget);
    if (district !== "Все") items = items.filter((l) => l.district === district);
    if (propType !== "Все") items = items.filter((l) => l.propertyType === propType);
    if (sortBy === "score") items.sort((a, b) => computeScore(b, niche) - computeScore(a, niche));
    else if (sortBy === "price") items.sort((a, b) => a.price - b.price);
    else if (sortBy === "price_m2") items.sort((a, b) => a.m2 - b.m2);
    else if (sortBy === "traffic")
      items.sort((a, b) => b.radius.pedestrian.weekday - a.radius.pedestrian.weekday);
    else if (sortBy === "population")
      items.sort(
        (a, b) => b.radius.housing.estPopulation - a.radius.housing.estPopulation,
      );
    return items;
  }, [budget, district, propType, sortBy, niche]);

  const selected = LISTINGS.find((l) => l.id === selectedId);

  return (
    <div className="font-[Manrope,system-ui,sans-serif] bg-[#08080f] text-[#d1d5db] min-h-screen">
      {/* HEADER */}
      <div className="px-4 pt-3.5 pb-2.5 border-b border-[#151520] sticky top-0 bg-[#08080f] z-10">
        <div className="flex gap-2 items-center mb-2">
          <div className="w-7 h-7 rounded-[7px] bg-gradient-to-br from-[#f59e0b] to-[#d97706] flex items-center justify-center text-[13px]">
            📍
          </div>
          <div>
            <h1 className="m-0 text-[15px] font-extrabold text-white tracking-tight">
              Location Intelligence Pro
            </h1>
            <p className="m-0 text-[9px] text-[#4b5563] tracking-wider uppercase">
              Алматы · Крыша + 2ГИС · {fmtN(LISTINGS.length)} помещений
            </p>
          </div>
        </div>

        {/* Выбор ниши */}
        <div className="flex gap-1.5 mb-2">
          {NICHES.map((n) => (
            <button
              key={n.id}
              onClick={() => {
                setNiche(n.id);
                setSelectedId(null);
              }}
              className={`flex-1 py-[7px] px-1 rounded-lg text-center cursor-pointer border-[1.5px] transition-colors ${
                niche === n.id
                  ? "border-[#f59e0b] bg-[#f59e0b]/[0.06]"
                  : "border-[#1e1e2a] bg-[#0f0f18]"
              }`}
            >
              <span className="text-[15px]">{n.icon}</span>
              <div
                className={`text-[9px] font-bold mt-0.5 ${
                  niche === n.id ? "text-[#fbbf24]" : "text-[#4b5563]"
                }`}
              >
                {n.label}
              </div>
            </button>
          ))}
        </div>

        {/* Табы: Список / Карта */}
        {!selected && (
          <div className="flex gap-1.5 mb-2">
            {(["list", "map"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer border transition-colors ${
                  tab === t
                    ? "border-[#fbbf24]/30 bg-[#fbbf24]/10 text-[#fbbf24]"
                    : "border-[#1e1e2a] bg-[#0f0f18] text-[#4b5563]"
                }`}
              >
                {t === "list" ? "📋 Список" : "🗺️ Карта"}
              </button>
            ))}
          </div>
        )}

        {/* Фильтры */}
        {!selected && tab === "list" && (
          <div className="flex gap-1.5">
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="flex-1 px-1.5 py-1.5 rounded-[7px] border border-[#1e1e2a] bg-[#0f0f18] text-[#9ca3af] text-[10px] font-semibold"
            >
              {DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d === "Все" ? "Все районы" : d}
                </option>
              ))}
            </select>
            <select
              value={propType}
              onChange={(e) => setPropType(e.target.value)}
              className="flex-1 px-1.5 py-1.5 rounded-[7px] border border-[#1e1e2a] bg-[#0f0f18] text-[#9ca3af] text-[10px] font-semibold"
            >
              {PROPERTY_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t === "Все" ? "Все типы" : t}
                </option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSort(e.target.value)}
              className="flex-1 px-1.5 py-1.5 rounded-[7px] border border-[#1e1e2a] bg-[#0f0f18] text-[#9ca3af] text-[10px] font-semibold"
            >
              <option value="score">По рейтингу</option>
              <option value="price">По цене ↑</option>
              <option value="price_m2">По ₸/м²</option>
              <option value="traffic">По трафику</option>
              <option value="population">По населению</option>
            </select>
          </div>
        )}
      </div>

      {/* КОНТЕНТ */}
      <div className="px-4 pt-3 pb-8">
        {selected ? (
          <ListingDetail listing={selected} niche={niche} onBack={() => setSelectedId(null)} />
        ) : tab === "map" ? (
          <div className="h-[calc(100vh-200px)] min-h-[400px]">
            <MapView
              listings={filtered}
              niche={niche}
              selectedId={selectedId}
              onSelect={setSelectedId}
              radius={mapRadius}
            />
          </div>
        ) : (
          <>
            {/* Слайдер бюджета */}
            <div className="mb-2.5">
              <div className="flex justify-between mb-0.5">
                <span className="text-[10px] text-[#4b5563]">Бюджет аренды</span>
                <span className="text-[11px] font-extrabold text-[#e5e7eb]">
                  {fmt(budget)} ₸/мес
                </span>
              </div>
              <input
                type="range"
                min={200000}
                max={10000000}
                step={100000}
                value={budget}
                onChange={(e) => setBudget(+e.target.value)}
                className="w-full accent-[#f59e0b] h-1"
              />
            </div>

            <div className="text-[10px] text-[#4b5563] mb-2.5">
              {filtered.length} помещений · нажмите для анализа
            </div>

            {/* Карточки */}
            {filtered.map((l) => (
              <ListingCard key={l.id} listing={l} niche={niche} onSelect={setSelectedId} />
            ))}

            {filtered.length === 0 && (
              <div className="text-center py-10 text-[#4b5563]">
                <div className="text-3xl mb-2">🔍</div>
                <div className="text-[13px]">Нет помещений по фильтрам</div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
