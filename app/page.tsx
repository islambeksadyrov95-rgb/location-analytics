"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { NICHES } from "@/lib/data";
import { computeBasicScore, fmtN } from "@/lib/scoring";
import type { Listing } from "@/lib/types";
import { ListingCard } from "@/components/ListingCard";
import { ListingDetail } from "@/components/ListingDetail";
import { Onboarding } from "@/components/Onboarding";
import { AdvancedFilters, DEFAULT_FILTERS, type FilterState } from "@/components/AdvancedFilters";
import { NicheSelector } from "@/components/NicheSelector";
import { SearchProgress } from "@/components/SearchProgress";

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

type ListingsState =
  | { status: "loading"; listings: Listing[]; total: number }
  | { status: "done"; listings: Listing[]; total: number }
  | { status: "error"; listings: Listing[]; total: number };

export default function Home() {
  const [showOnboarding, setShowOnboarding] = useState(() =>
    typeof window !== "undefined" ? !localStorage.getItem(ONBOARDING_KEY) : false
  );
  const [niche, setNiche] = useState("coffee");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [showNicheSelector, setShowNicheSelector] = useState(false);
  const [tab, setTab] = useState<Tab>("list");
  const [mapRadius] = useState(1000);

  // Real-time search state
  const [searchState, setSearchState] = useState<"idle" | "searching" | "done">("idle");
  const [searchProgress, setSearchProgress] = useState(0);
  const [searchStage, setSearchStage] = useState("");

  const [data, setData] = useState<ListingsState>({ status: "loading", listings: [], total: 0 });
  const reqRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);

  // Real-time поиск через SSE
  const startSearch = () => {
    // Отменяем предыдущий поиск
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setSearchState("searching");
    setSearchProgress(0);
    setSearchStage("Подготовка...");
    setData({ status: "loading", listings: [], total: 0 });

    const params = new URLSearchParams({
      budget: String(filters.budget),
      district: filters.district,
      propType: filters.propType,
      areaMin: String(filters.areaMin),
      areaMax: String(filters.areaMax),
      niche,
    });

    fetch(`/api/search/stream?${params}`, { signal: controller.signal })
      .then(async (res) => {
        if (!res.body) throw new Error("No stream");
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() || "";

          for (const block of lines) {
            if (!block.startsWith("data: ")) continue;
            try {
              const event = JSON.parse(block.slice(6));
              setSearchProgress(event.progress || 0);
              setSearchStage(event.message || "");

              if (event.stage === "done" && event.listings) {
                setData({ status: "done", listings: event.listings, total: event.listings.length });
                setSearchState("done");
              }
              if (event.stage === "error") {
                setData({ status: "error", listings: [], total: 0 });
                setSearchState("done");
              }
            } catch { /* skip malformed */ }
          }
        }
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setData({ status: "error", listings: [], total: 0 });
          setSearchState("done");
        }
      });
  };

  // Загрузка из БД (для первоначального отображения)
  useEffect(() => {
    if (searchState === "searching") return;
    const reqId = ++reqRef.current;
    const params = new URLSearchParams({
      budget: String(filters.budget),
      district: filters.district,
      propType: filters.propType,
      condition: filters.condition,
      entrance: filters.entrance,
      areaMin: String(filters.areaMin),
      areaMax: String(filters.areaMax),
      floorMax: String(filters.floorMax),
      ceilingsMin: String(filters.ceilingsMin),
      sortBy: filters.sortBy,
    });

    fetch(`/api/listings?${params}`)
      .then((res) => res.json())
      .then((result) => {
        if (reqRef.current === reqId) {
          setData({ status: "done", listings: result.listings || [], total: result.total || 0 });
        }
      })
      .catch(() => {
        if (reqRef.current === reqId) {
          setData({ status: "error", listings: [], total: 0 });
        }
      });
  }, [filters, searchState]);

  const listings = data.listings;
  const totalCount = data.total;
  const loadingListings = data.status === "loading";

  // Клиентская сортировка по скорингу (score зависит от фронтенда)
  const sorted = useMemo(() => {
    if (filters.sortBy === "score") {
      return [...listings].sort((a, b) => computeBasicScore(b) - computeBasicScore(a));
    }
    return listings;
  }, [listings, filters.sortBy]);

  const selected = listings.find((l) => l.id === selectedId);
  const currentNiche = NICHES.find((n) => n.id === niche);

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

  if (showNicheSelector) {
    return (
      <NicheSelector
        selected={niche}
        onSelect={(id) => {
          setNiche(id);
          setSelectedId(null);
        }}
        onClose={() => setShowNicheSelector(false)}
      />
    );
  }

  if (showFilters) {
    return (
      <AdvancedFilters
        filters={filters}
        onChange={setFilters}
        onClose={() => setShowFilters(false)}
        resultCount={sorted.length}
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
              Алматы · Крыша + 2ГИС · {loadingListings ? "..." : fmtN(totalCount)} помещений
            </p>
          </div>
          <button
            onClick={() => setShowOnboarding(true)}
            className="w-7 h-7 rounded-full bg-[#1e1e2a] border-none text-[#6b7280] text-xs cursor-pointer flex items-center justify-center"
            title="О сервисе"
          >
            ?
          </button>
        </div>

        {/* Выбор ниши + поиск */}
        <div className="flex gap-1.5 mb-2">
          <button
            onClick={() => setShowNicheSelector(true)}
            className="flex-1 py-[7px] px-3 rounded-lg cursor-pointer border-[1.5px] border-[#f59e0b] bg-[#f59e0b]/[0.06] flex items-center gap-2"
          >
            <span className="text-[15px]">{currentNiche?.icon}</span>
            <span className="text-[11px] font-bold text-[#fbbf24]">{currentNiche?.label}</span>
            <span className="text-[9px] text-[#4b5563] ml-auto">&#9662;</span>
          </button>
          <button
            onClick={startSearch}
            disabled={searchState === "searching"}
            className="px-4 py-[7px] rounded-lg cursor-pointer border-[1.5px] border-[#22c55e] bg-[#22c55e]/10 text-[#22c55e] text-[11px] font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {searchState === "searching" ? "Ищу..." : "Live-поиск"}
          </button>
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
        {searchState === "searching" ? (
          <SearchProgress progress={searchProgress} stage={searchStage} />
        ) : selected ? (
          <ListingDetail listing={selected} niche={niche} onBack={() => setSelectedId(null)} />
        ) : tab === "map" ? (
          <div className="h-[calc(100vh-180px)] min-h-[400px]">
            <MapView
              listings={sorted}
              niche={niche}
              selectedId={selectedId}
              onSelect={setSelectedId}
              radius={mapRadius}
            />
          </div>
        ) : (
          <>
            {loadingListings ? (
              <div className="text-center py-10">
                <div className="text-2xl mb-2 animate-pulse">🔍</div>
                <div className="text-xs text-[#6b7280]">Загружаем помещения...</div>
              </div>
            ) : (
              <>
                <div className="text-[10px] text-[#4b5563] mb-2.5">
                  {sorted.length} помещений · нажмите для анализа
                </div>

                {sorted.map((l) => (
                  <ListingCard key={l.id} listing={l} onSelect={setSelectedId} />
                ))}

                {sorted.length === 0 && (
                  <div className="text-center py-10 text-[#4b5563]">
                    <div className="text-3xl mb-2">🔍</div>
                    <div className="text-[13px] mb-3">
                      {totalCount === 0
                        ? "Нет данных. Запустите парсеры для загрузки объявлений."
                        : "Нет помещений по фильтрам"}
                    </div>
                    {totalCount > 0 && (
                      <button
                        onClick={() => setFilters(DEFAULT_FILTERS)}
                        className="px-4 py-2 rounded-lg bg-[#1e1e2a] border-none text-[#fbbf24] text-xs font-semibold cursor-pointer"
                      >
                        Сбросить фильтры
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
