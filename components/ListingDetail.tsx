"use client";

import { useState, useEffect, useRef } from "react";
import type { Listing, RadiusData } from "@/lib/types";
import { computeFullScore, computeBasicScore, fmt, fmtN, SQ_M_PER_PERSON } from "@/lib/scoring";
import { downloadReport } from "@/lib/report";
import { ScoreRing } from "./ScoreRing";
import { PhotoCarousel } from "./PhotoCarousel";
import { Section } from "./Section";

type AnalysisState =
  | { status: "loading"; data: null }
  | { status: "done"; data: RadiusData }
  | { status: "error"; data: null };

interface Props {
  listing: Listing;
  niche: string;
  onBack: () => void;
}

export function ListingDetail({ listing: l, niche, onBack }: Props) {
  const [radius, setRadius] = useState(1000);
  const [state, setState] = useState<AnalysisState>({ status: "loading", data: null });
  const reqRef = useRef(0);

  useEffect(() => {
    const reqId = ++reqRef.current;
    fetch(`/api/listings/${l.id}/analysis?radius=${radius}&niche=${niche}`)
      .then((res) => res.json())
      .then((data) => {
        if (reqRef.current === reqId) setState({ status: "done", data });
      })
      .catch(() => {
        if (reqRef.current === reqId) setState({ status: "error", data: null });
      });
  }, [l.id, radius, niche]);

  const analysis = state.data;
  const loading = state.status === "loading";

  const score = analysis ? computeFullScore(l, analysis) : computeBasicScore(l);
  const r = analysis;
  const inR = <T extends { dist: number }>(arr: T[]) => arr.filter((x) => x.dist <= radius);

  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 bg-transparent border-none text-[#6b7280] cursor-pointer text-xs pb-2.5 font-semibold"
      >
        ← Назад
      </button>

      <div className="rounded-[14px] overflow-hidden mb-3.5">
        <PhotoCarousel photos={l.photos} />
      </div>

      {/* Заголовок + скоринг */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="text-[17px] font-extrabold text-white leading-tight">
            {l.area} м² · {l.district}
          </div>
          <div className="text-xs text-[#6b7280] mt-0.5">{l.address}</div>
          <div className="flex items-baseline gap-2 mt-1.5">
            <span className="text-2xl font-black text-[#fbbf24]">{fmt(l.price)} ₸</span>
            <span className="text-xs text-[#6b7280]">
              /мес · {fmt(l.m2)} ₸/м²
            </span>
          </div>
        </div>
        <ScoreRing score={score} size={58} />
      </div>

      {/* Теги */}
      <div className="flex flex-wrap gap-1 mb-3.5">
        {[l.propertyType, l.condition, `${l.ceilings}м потолки`, l.entrance, `${l.floor} этаж`].map(
          (t, i) => (
            <span
              key={i}
              className="text-[10px] px-2 py-0.5 rounded-md bg-[#1e1e2a] text-[#9ca3af]"
            >
              {t}
            </span>
          ),
        )}
      </div>

      {/* Слайдер радиуса */}
      <div className="bg-[#12121a] rounded-xl p-3.5 border border-[#1e1e2a] mb-3.5">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs font-bold text-[#e5e7eb]">Радиус анализа</span>
          <span className="text-[15px] font-black text-[#fbbf24]">
            {radius >= 1000 ? radius / 1000 + "км" : radius + "м"}
          </span>
        </div>
        <input
          type="range"
          min={250}
          max={2500}
          step={250}
          value={radius}
          onChange={(e) => setRadius(+e.target.value)}
          className="w-full accent-[#f59e0b] h-1.5"
        />
        <div className="flex justify-between text-[9px] text-[#4b5563] mt-0.5">
          {[250, 500, 750, 1000, 1500, 2000, 2500].map((v) => (
            <span key={v}>{v >= 1000 ? v / 1000 + "км" : v}</span>
          ))}
        </div>
      </div>

      {/* Загрузка анализа */}
      {loading ? (
        <div className="text-center py-10">
          <div className="text-2xl mb-2 animate-pulse">📊</div>
          <div className="text-xs text-[#6b7280]">Анализируем локацию...</div>
        </div>
      ) : !r ? (
        <div className="text-center py-10 text-[#6b7280]">
          <div className="text-2xl mb-2">⚠️</div>
          <div className="text-xs">Нет данных для анализа. Парсеры ещё не запущены.</div>
        </div>
      ) : (
        <>
          {/* Ключевые метрики */}
          <div className="grid grid-cols-4 gap-1.5 mb-3.5">
            {[
              {
                v: inR(r.direct).length,
                l: "Конкурентов",
                c:
                  inR(r.direct).length <= 2
                    ? "#34d399"
                    : inR(r.direct).length <= 4
                      ? "#fbbf24"
                      : "#f87171",
              },
              { v: fmt(r.pedestrian.weekday), l: "Пешеходов/д", c: "#60a5fa" },
              { v: fmtN(r.housing.estPopulation), l: "Жителей", c: "#a78bfa" },
              { v: r.housing.buildings, l: "Домов", c: "#f472b6" },
            ].map((m, i) => (
              <div
                key={i}
                className="bg-[#12121a] rounded-[10px] py-2.5 px-1 text-center border border-[#1e1e2a]"
              >
                <div className="text-[17px] font-black leading-none" style={{ color: m.c }}>
                  {m.v}
                </div>
                <div className="text-[8px] text-[#6b7280] mt-1 leading-tight">{m.l}</div>
              </div>
            ))}
          </div>

          {/* Прямые конкуренты */}
          <Section title="Прямые конкуренты" icon="🔴" count={inR(r.direct).length} open>
            {inR(r.direct).length === 0 ? (
              <div className="text-xs text-[#34d399] py-1.5">
                Нет конкурентов в радиусе — отличная позиция!
              </div>
            ) : (
              inR(r.direct).map((c, i) => (
                <div
                  key={i}
                  className={`flex justify-between items-center py-[7px] ${
                    i < inR(r.direct).length - 1 ? "border-b border-[#1a1a24]" : ""
                  }`}
                >
                  <div>
                    <div className="text-[13px] font-semibold text-[#e5e7eb]">
                      {c.name}
                      {c.branches && (
                        <span className="text-[10px] text-[#6b7280]"> ({c.branches} фил.)</span>
                      )}
                    </div>
                    <div className="text-[11px] text-[#6b7280]">
                      ★{c.rating} · {fmtN(c.reviews)} отзывов
                      {c.check ? ` · чек ${fmt(c.check)}₸` : ""}
                    </div>
                  </div>
                  <div
                    className={`text-xs font-bold whitespace-nowrap ${
                      c.dist < 300 ? "text-[#f87171]" : "text-[#fbbf24]"
                    }`}
                  >
                    {c.dist}м
                  </div>
                </div>
              ))
            )}
          </Section>

          {/* Косвенные конкуренты */}
          <Section title="Косвенные конкуренты" icon="🟡" count={inR(r.indirect).length}>
            {inR(r.indirect).map((c, i) => (
              <div
                key={i}
                className="flex justify-between py-1.5 border-b border-[#1a1a24]"
              >
                <div className="text-[13px] text-[#e5e7eb]">
                  {c.name}{" "}
                  <span className="text-[11px] text-[#6b7280]">
                    ({c.type}){c.rating ? ` ★${c.rating}` : ""}
                    {c.branches ? ` ${c.branches} фил.` : ""}
                  </span>
                </div>
                <div className="text-[11px] text-[#9ca3af]">{c.dist}м</div>
              </div>
            ))}
          </Section>

          {/* Синергия */}
          <Section title="Синергия — приводят клиентов" icon="🟢" count={inR(r.synergy).length} open>
            {inR(r.synergy).map((c, i) => (
              <div key={i} className="py-[7px] border-b border-[#1a1a24]">
                <div className="flex justify-between">
                  <div className="text-[13px] font-semibold text-[#e5e7eb]">{c.name}</div>
                  <div className="text-[11px] text-[#34d399] font-semibold">{c.dist}м</div>
                </div>
                <div className="text-[11px] text-[#6b7280]">
                  {c.type}{c.people ? ` · ${c.people}` : ""}
                </div>
              </div>
            ))}
          </Section>

          {/* Транспорт */}
          <Section title="Транспорт" icon="🚌" count={inR(r.transport).length} open>
            {inR(r.transport).map((c, i) => (
              <div
                key={i}
                className="flex justify-between items-center py-1.5 border-b border-[#1a1a24]"
              >
                <div>
                  <div className="text-[13px] text-[#e5e7eb]">{c.name}</div>
                  <div className="text-[11px] text-[#6b7280]">
                    {c.routes.length > 0 ? `Маршруты: ${c.routes.join(", ")}` : ""}
                  </div>
                </div>
                <div className="text-[11px] text-[#60a5fa] font-semibold">{c.dist}м</div>
              </div>
            ))}
          </Section>

          {/* Гос. учреждения */}
          <Section title="Гос. учреждения" icon="🏛️" count={inR(r.gov).length}>
            {inR(r.gov).map((c, i) => (
              <div key={i} className="flex justify-between py-1.5">
                <div>
                  <div className="text-[13px] text-[#e5e7eb]">{c.name}</div>
                  <div className="text-[10px] text-[#6b7280]">{c.type}</div>
                </div>
                <div className="text-[11px] text-[#9ca3af]">{c.dist}м</div>
              </div>
            ))}
          </Section>

          {/* Жилой фонд */}
          <Section title="Жилой фонд — объём рынка" icon="🏠" open>
            <div className="grid grid-cols-2 gap-1.5 mb-2">
              {[
                { l: "Жилых домов", v: r.housing.buildings },
                { l: "Квартир", v: fmtN(r.housing.apartments) },
                { l: "Население (расчёт)", v: fmtN(r.housing.estPopulation) },
                { l: "Ср. площадь квартиры", v: r.housing.avgApartmentM2 + " м²" },
              ].map((s, i) => (
                <div key={i} className="bg-[#12121a] rounded-lg px-2.5 py-2">
                  <div className="text-[9px] text-[#6b7280]">{s.l}</div>
                  <div className="text-[15px] font-extrabold text-[#e5e7eb]">{s.v}</div>
                </div>
              ))}
            </div>
            <div className="text-[10px] text-[#4b5563] leading-relaxed py-1">
              Формула: площадь жилья ÷ {SQ_M_PER_PERSON} м²/чел ={" "}
              {fmtN(r.housing.estPopulation)} жителей
              <br />
              Источник нормы: stat.gov.kz, 2025 — обеспеченность жильём в городах РК
            </div>
          </Section>

          {/* Пешеходный трафик */}
          <Section title="Пешеходный трафик" icon="🚶">
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { l: "Будни", v: fmtN(r.pedestrian.weekday) + "/день" },
                { l: "Выходные", v: fmtN(r.pedestrian.weekend) + "/день" },
                { l: "Пиковый час", v: fmtN(r.pedestrian.peakHour) + "/час" },
              ].map((s, i) => (
                <div key={i} className="bg-[#12121a] rounded-lg px-2.5 py-2">
                  <div className="text-[9px] text-[#6b7280]">{s.l}</div>
                  <div className="text-sm font-extrabold text-[#60a5fa]">{s.v}</div>
                </div>
              ))}
            </div>
            <div className="text-[10px] text-[#4b5563] mt-1.5">
              Источник: {r.pedestrian.source}
            </div>
          </Section>
        </>
      )}

      {/* Контакты и ссылка */}
      <div className="bg-[#12121a] rounded-xl p-3.5 border border-[#1e1e2a] mt-2.5">
        <div className="text-[11px] font-bold text-[#e5e7eb] mb-2">Контакты</div>
        {l.phone && (
          <a
            href={`tel:${l.phone}`}
            className="flex items-center gap-2 py-2.5 px-3 bg-[#0f0f18] rounded-lg border border-[#1e1e2a] text-[#fbbf24] text-sm font-bold no-underline mb-2"
          >
            <span>📞</span> {l.phone}
          </a>
        )}
        {l.sourceUrl && (
          <a
            href={l.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 py-2.5 px-3 bg-[#0f0f18] rounded-lg border border-[#1e1e2a] text-[#60a5fa] text-xs font-semibold no-underline"
          >
            <span>🔗</span> Открыть на Крыша.kz
          </a>
        )}
      </div>

      {/* Источники данных */}
      <div className="bg-[#fbbf24]/[0.03] rounded-xl p-3.5 border border-[#fbbf24]/[0.08] mt-2.5">
        <div className="text-[11px] font-bold text-[#fbbf24] mb-1.5">Источники данных</div>
        <div className="text-[10px] text-[#9ca3af] leading-relaxed">
          <b>Аренда + фото:</b> krisha.kz (парсер)
          <br />
          <b>Конкуренты + инфра:</b> 2gis.kz (API)
          <br />
          <b>Население:</b> 2ГИС (здания) + stat.gov.kz (27.4 м²/чел)
          <br />
          <b>Объявление:</b> {l.source}
        </div>
      </div>

      {/* Скачать отчёт */}
      {analysis && (
        <button
          onClick={() => downloadReport(l, niche, analysis || undefined)}
          className="w-full mt-4 py-3.5 rounded-xl bg-[#fbbf24] text-[#08080f] font-bold text-sm cursor-pointer border-none active:opacity-80 transition-opacity"
        >
          Скачать отчёт
        </button>
      )}
    </div>
  );
}
