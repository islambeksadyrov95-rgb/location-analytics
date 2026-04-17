"use client";

import { useState, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import { LISTINGS, NICHES } from "@/lib/data";
import { computeScore, fmtN } from "@/lib/scoring";
import { ListingCard } from "@/components/ListingCard";
import { ListingDetail } from "@/components/ListingDetail";
import { Onboarding } from "@/components/Onboarding";
import { AdvancedFilters, DEFAULT_FILTERS, type FilterState } from "@/components/AdvancedFilters";

const MapView = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#12121a] rounded-xl flex items-center justify-center text-[#4b5563]">
      Загрузка карты...
    </div>
  ),
});

type Tab = "list" | "map";
const ONBOARDING_KEY = "lip_onboarding_done";

export default function Home() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [niche, setNiche] = useState("coffee");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [tab, setTab] = useState<Tab>("list");
  const [mapRadius] = useState(1000);

  // Проверяем показывали ли онбординг
  useEffect(() => {
    if (typeof window !== "undefined" && !localStorage.getItem(ONBOARDING_KEY)) {
      setShowOnboarding(true);
    }
  }, []);

  const filtered = useMemo(() => {
    let items = LISTINGS.filter((l) => l.price <= filters.budget);
    if (filters.district !== "Все") items = items.filter((l) => l.district === filters.district);
    if (filters.propType !== "Все") items = items.filter((l) => l.propertyType === filters.propType);
    if (filters.condition !== "Все") items = items.filter((l) => l.condition === filters.condition);
    if (filters.entrance !== "Все") items = items.filter((l) => l.entrance === filters.entrance);
    if (filters.areaMin > 0) items = items.filter((l) => l.area >= filters.areaMin);
    if (filters.areaMax < 1000) items = items.filter((l) => l.area <= filters.areaMax);
    if (filters.floorMax < 10) items = items.filter((l) => l.floor <= filters.floorMax);
    if (filters.ceilingsMin > 0) items = items.filter((l) => l.ceilings >= filters.ceilingsMin);

    if (filters.sortBy === "score") items.sort((a, b) => computeScore(b, niche) - computeScore(a, niche));
    else if (filters.sortBy === "price") items.sort((a, b) => a.price - b.price);
    else if (filters.sortBy === "price_m2") items.sort((a, b) => a.m2 - b.m2);
    else if (filters.sortBy === "traffic")
      items.sort((a, b) => b.radius.pedestrian.weekday - a.radius.pedestrian.weekday);
    else if (filters.sortBy === "population")
      items.sort((a, b) => b.radius.housing.estPopulation - a.radius.housing.estPopulation);
    else if (filters.sortBy === "area") items.sort((a, b) => b.area - a.area);
    return items;
  }, [filters, niche]);

  const selected = LISTINGS.find((l) => l.id === selectedId);

  // Кол-во активных фильтров
  const activeFilterCount = Object.entries(filters).filter(([key, val]) => {
    const def = DEFAULT_FILTERS[key as keyof FilterState];
    return val !== def;
  }).length;

  if (showOnboarding) {
    return (
      <Onboarding
        onComplete={() => {
          localStorage.setItem(ONBOARDING_KEY, "1");
          setShowOnboarding(false);
        }}
      />
    );
  }

  if (showFilters) {
    return (
      <AdvancedFilters
        filters={filters}
        onChange={setFilters}
        onClose={() => setShowFilters(false)}
        resultCount={filtered.length}
      />
    );
  }

  return (
    <div className="font-[Manrope,system-ui,sans-serif] bg-[#08080f] text-[#d1d5db] min-h-screen">
      {/* HEADER */}
      <div className="px-4 pt-3.5 pb-2.5 border-b border-[#151520] sticky top-0 bg-[#08080f] z-10">
        <div className="flex gap-2 items-center mb-2">
          <div className="w-7 h-7 rounded-[7px] bg-gradient-to-br from-[#f59e0b] to-[#d97706] flex items-center justify-center text-[13px]">
            📍
          </div>
          <div className="flex-1">
            <h1 className="m-0 text-[15px] font-extrabold text-white tracking-tight">
              Location Intelligence Pro
            </h1>
            <p className="m-0 text-[9px] text-[#4b5563] tracking-wider uppercase">
              Алматы · Крыша + 2ГИС · {fmtN(LISTINGS.length)} помещений
            </p>
          </div>
          {/* Кнопка "О сервисе" */}
          <button
            onClick={() => setShowOnboarding(true)}
            className="w-7 h-7 rounded-full bg-[#1e1e2a] border-none text-[#6b7280] text-xs cursor-pointer flex items-center justify-center"
            title="О сервисе"
          >
            ?
          </button>
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

        {/* Табы + фильтры */}
        {!selected && (
          <div className="flex gap-1.5">
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
            <button
              onClick={() => setShowFilters(true)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer border transition-colors ${
                activeFilterCount > 0
                  ? "border-[#fbbf24]/30 bg-[#fbbf24]/10 text-[#fbbf24]"
                  : "border-[#1e1e2a] bg-[#0f0f18] text-[#4b5563]"
              }`}
            >
              ⚙️ Фильтры{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
            </button>
          </div>
        )}
      </div>

      {/* КОНТЕНТ */}
      <div className="px-4 pt-3 pb-8">
        {selected ? (
          <ListingDetail listing={selected} niche={niche} onBack={() => setSelectedId(null)} />
        ) : tab === "map" ? (
          <div className="h-[calc(100vh-180px)] min-h-[400px]">
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
            <div className="text-[10px] text-[#4b5563] mb-2.5">
              {filtered.length} из {LISTINGS.length} помещений · нажмите для анализа
            </div>

            {filtered.map((l) => (
              <ListingCard key={l.id} listing={l} niche={niche} onSelect={setSelectedId} />
            ))}

            {filtered.length === 0 && (
              <div className="text-center py-10 text-[#4b5563]">
                <div className="text-3xl mb-2">🔍</div>
                <div className="text-[13px] mb-3">Нет помещений по фильтрам</div>
                <button
                  onClick={() => setFilters(DEFAULT_FILTERS)}
                  className="px-4 py-2 rounded-lg bg-[#1e1e2a] border-none text-[#fbbf24] text-xs font-semibold cursor-pointer"
                >
                  Сбросить фильтры
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
