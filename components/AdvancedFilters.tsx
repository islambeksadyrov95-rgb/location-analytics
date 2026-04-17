"use client";

import { DISTRICTS, PROPERTY_TYPES, CONDITIONS, ENTRANCES } from "@/lib/data";

export interface FilterState {
  district: string;
  propType: string;
  condition: string;
  entrance: string;
  areaMin: number;
  areaMax: number;
  floorMax: number;
  ceilingsMin: number;
  sortBy: string;
  budget: number;
}

export const DEFAULT_FILTERS: FilterState = {
  district: "Все",
  propType: "Все",
  condition: "Все",
  entrance: "Все",
  areaMin: 0,
  areaMax: 1000,
  floorMax: 10,
  ceilingsMin: 0,
  sortBy: "score",
  budget: 10000000,
};

interface Props {
  filters: FilterState;
  onChange: (f: FilterState) => void;
  onClose: () => void;
  resultCount: number;
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3.5">
      <div className="text-[10px] text-[#6b7280] font-semibold mb-1">{label}</div>
      {children}
    </div>
  );
}

function SelectFilter({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 rounded-lg border border-[#1e1e2a] bg-[#0f0f18] text-[#d1d5db] text-xs font-semibold"
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

export function AdvancedFilters({ filters, onChange, onClose, resultCount }: Props) {
  const set = (key: keyof FilterState, val: string | number) =>
    onChange({ ...filters, [key]: val });

  return (
    <div className="fixed inset-0 bg-[#08080f] z-50 overflow-y-auto">
      <div className="px-4 py-4">
        {/* Хедер */}
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-black text-white m-0">Фильтры</h2>
          <button
            onClick={onClose}
            className="text-[#6b7280] bg-transparent border-none cursor-pointer text-lg"
          >
            ✕
          </button>
        </div>

        {/* Район */}
        <FilterRow label="Район">
          <SelectFilter value={filters.district} options={DISTRICTS} onChange={(v) => set("district", v)} />
        </FilterRow>

        {/* Тип помещения */}
        <FilterRow label="Тип помещения">
          <SelectFilter value={filters.propType} options={PROPERTY_TYPES} onChange={(v) => set("propType", v)} />
        </FilterRow>

        {/* Состояние */}
        <FilterRow label="Состояние">
          <SelectFilter value={filters.condition} options={CONDITIONS} onChange={(v) => set("condition", v)} />
        </FilterRow>

        {/* Вход */}
        <FilterRow label="Тип входа">
          <SelectFilter value={filters.entrance} options={ENTRANCES} onChange={(v) => set("entrance", v)} />
        </FilterRow>

        {/* Бюджет */}
        <FilterRow label={`Бюджет аренды: до ${filters.budget >= 1e6 ? (filters.budget / 1e6).toFixed(1) + " млн" : Math.round(filters.budget / 1000) + "к"} ₸/мес`}>
          <input
            type="range"
            min={100000}
            max={10000000}
            step={100000}
            value={filters.budget}
            onChange={(e) => set("budget", +e.target.value)}
            className="w-full accent-[#f59e0b] h-1.5"
          />
          <div className="flex justify-between text-[9px] text-[#4b5563] mt-1">
            <span>100к</span>
            <span>10 млн</span>
          </div>
        </FilterRow>

        {/* Площадь */}
        <FilterRow label={`Площадь: ${filters.areaMin}–${filters.areaMax} м²`}>
          <div className="flex gap-2 items-center">
            <input
              type="number"
              value={filters.areaMin}
              onChange={(e) => set("areaMin", Math.max(0, +e.target.value))}
              placeholder="от"
              className="flex-1 px-3 py-2 rounded-lg border border-[#1e1e2a] bg-[#0f0f18] text-[#d1d5db] text-xs"
            />
            <span className="text-[#4b5563] text-xs">—</span>
            <input
              type="number"
              value={filters.areaMax}
              onChange={(e) => set("areaMax", +e.target.value)}
              placeholder="до"
              className="flex-1 px-3 py-2 rounded-lg border border-[#1e1e2a] bg-[#0f0f18] text-[#d1d5db] text-xs"
            />
          </div>
        </FilterRow>

        {/* Этаж */}
        <FilterRow label={`Этаж: до ${filters.floorMax}`}>
          <input
            type="range"
            min={1}
            max={15}
            value={filters.floorMax}
            onChange={(e) => set("floorMax", +e.target.value)}
            className="w-full accent-[#f59e0b] h-1.5"
          />
          <div className="flex justify-between text-[9px] text-[#4b5563] mt-1">
            <span>1</span>
            <span>15</span>
          </div>
        </FilterRow>

        {/* Потолки */}
        <FilterRow label={`Потолки: от ${filters.ceilingsMin} м`}>
          <input
            type="range"
            min={0}
            max={6}
            step={0.5}
            value={filters.ceilingsMin}
            onChange={(e) => set("ceilingsMin", +e.target.value)}
            className="w-full accent-[#f59e0b] h-1.5"
          />
          <div className="flex justify-between text-[9px] text-[#4b5563] mt-1">
            <span>Любые</span>
            <span>6м</span>
          </div>
        </FilterRow>

        {/* Сортировка */}
        <FilterRow label="Сортировка">
          <SelectFilter
            value={filters.sortBy}
            options={["score", "price", "price_m2", "traffic", "population", "area"]}
            onChange={(v) => set("sortBy", v)}
          />
          <div className="text-[9px] text-[#4b5563] mt-1">
            {
              {
                score: "По скорингу (лучшие локации сверху)",
                price: "По цене аренды (дешёвые сверху)",
                price_m2: "По цене за м² (дешёвые сверху)",
                traffic: "По пешеходному трафику (больше сверху)",
                population: "По населению рядом (больше сверху)",
                area: "По площади (большие сверху)",
              }[filters.sortBy]
            }
          </div>
        </FilterRow>

        {/* Сброс */}
        <button
          onClick={() => onChange(DEFAULT_FILTERS)}
          className="w-full py-2 rounded-lg border border-[#1e1e2a] bg-transparent text-[#6b7280] text-xs font-semibold cursor-pointer mb-3"
        >
          Сбросить все фильтры
        </button>

        {/* Показать */}
        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-xl bg-[#fbbf24] text-[#08080f] font-bold text-sm cursor-pointer border-none"
        >
          Показать {resultCount} помещений
        </button>
      </div>
    </div>
  );
}
