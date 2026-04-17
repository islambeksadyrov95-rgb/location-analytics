"use client";

import { useState } from "react";
import { NICHES, NICHE_CATEGORIES } from "@/lib/data";

interface Props {
  selected: string;
  onSelect: (nicheId: string) => void;
  onClose: () => void;
}

export function NicheSelector({ selected, onSelect, onClose }: Props) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = NICHES.filter((n) => {
    const matchesSearch = !search || n.label.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !activeCategory || n.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#08080f] px-4 pt-4 pb-8">
      {/* Шапка */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-[#1e1e2a] border-none text-[#9ca3af] text-sm cursor-pointer flex items-center justify-center"
        >
          &larr;
        </button>
        <h2 className="text-[17px] font-extrabold text-white m-0">Выбор ниши</h2>
      </div>

      {/* Поиск */}
      <input
        type="text"
        placeholder="Поиск ниши..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          if (e.target.value) setActiveCategory(null);
        }}
        className="w-full py-2.5 px-3.5 rounded-xl bg-[#12121a] border border-[#1e1e2a] text-[#d1d5db] text-sm outline-none placeholder:text-[#4b5563] mb-3"
      />

      {/* Категории */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-hide">
        <button
          onClick={() => setActiveCategory(null)}
          className={`shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer border transition-colors ${
            !activeCategory
              ? "border-[#f59e0b] bg-[#f59e0b]/10 text-[#fbbf24]"
              : "border-[#1e1e2a] bg-[#0f0f18] text-[#4b5563]"
          }`}
        >
          Все
        </button>
        {NICHE_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
            className={`shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer border transition-colors ${
              activeCategory === cat.id
                ? "border-[#f59e0b] bg-[#f59e0b]/10 text-[#fbbf24]"
                : "border-[#1e1e2a] bg-[#0f0f18] text-[#4b5563]"
            }`}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      {/* Сетка ниш */}
      <div className="grid grid-cols-3 gap-2">
        {filtered.map((n) => (
          <button
            key={n.id}
            onClick={() => {
              onSelect(n.id);
              onClose();
            }}
            className={`flex flex-col items-center justify-center py-3.5 px-2 rounded-xl cursor-pointer border-[1.5px] transition-colors ${
              selected === n.id
                ? "border-[#f59e0b] bg-[#f59e0b]/[0.08]"
                : "border-[#1e1e2a] bg-[#0f0f18] hover:border-[#2a2a3a]"
            }`}
          >
            <span className="text-2xl mb-1">{n.icon}</span>
            <span
              className={`text-[10px] font-bold leading-tight text-center ${
                selected === n.id ? "text-[#fbbf24]" : "text-[#9ca3af]"
              }`}
            >
              {n.label}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-10 text-[#4b5563] text-sm">
          Ниша не найдена
        </div>
      )}
    </div>
  );
}
