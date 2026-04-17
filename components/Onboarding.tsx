"use client";

import { useState } from "react";

const STEPS = [
  {
    title: "Location Intelligence Pro",
    subtitle: "Алматы",
    description:
      "Платформа геоаналитики для выбора идеальной локации вашего бизнеса. Принимайте решения на данных, а не на интуиции.",
    visual: "📍",
    points: [
      "Анализ 20+ помещений в аренду",
      "Данные из Крыша.kz и 2ГИС",
      "Оценка конкуренции и трафика",
    ],
  },
  {
    title: "Как это работает",
    subtitle: "3 простых шага",
    description: "",
    visual: "🔍",
    points: [
      "1. Выберите нишу — кофейня, донерная или ресторан",
      "2. Фильтруйте по району, бюджету, площади, этажу",
      "3. Откройте помещение — получите полный радиусный анализ",
    ],
  },
  {
    title: "Что вы получите",
    subtitle: "По каждому помещению",
    description: "",
    visual: "📊",
    points: [
      "Скоринг локации 0–100 баллов",
      "Конкуренты в радиусе (прямые и косвенные)",
      "Население и пешеходный трафик рядом",
      "Синергия — кто приводит клиентов (БЦ, ТЦ, вузы)",
      "Транспортная доступность",
    ],
  },
  {
    title: "Скачайте отчёт",
    subtitle: "Для принятия решений",
    description:
      "После анализа вы можете скачать детальный отчёт по помещению — для себя, партнёров или инвесторов.",
    visual: "📄",
    points: [
      "PDF-отчёт с полной аналитикой",
      "Карта конкурентов и инфраструктуры",
      "Данные для бизнес-плана",
    ],
  },
];

interface Props {
  onComplete: () => void;
}

export function Onboarding({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div className="min-h-screen bg-[#08080f] flex flex-col justify-between px-6 py-8">
      {/* Прогресс */}
      <div className="flex gap-1.5 mb-8">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={`h-1 rounded-full flex-1 transition-colors ${
              i <= step ? "bg-[#fbbf24]" : "bg-[#1e1e2a]"
            }`}
          />
        ))}
      </div>

      {/* Контент */}
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div className="text-6xl mb-6">{current.visual}</div>
        <h1 className="text-2xl font-black text-white mb-1">{current.title}</h1>
        <p className="text-sm text-[#fbbf24] font-semibold mb-4">{current.subtitle}</p>
        {current.description && (
          <p className="text-sm text-[#9ca3af] leading-relaxed mb-6 max-w-xs">
            {current.description}
          </p>
        )}
        <div className="w-full max-w-xs text-left space-y-2.5">
          {current.points.map((p, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#fbbf24] mt-1.5 shrink-0" />
              <span className="text-sm text-[#d1d5db] leading-relaxed">{p}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Кнопки */}
      <div className="flex gap-3 mt-8">
        {step > 0 && (
          <button
            onClick={() => setStep(step - 1)}
            className="flex-1 py-3.5 rounded-xl border border-[#1e1e2a] bg-transparent text-[#9ca3af] font-bold text-sm cursor-pointer"
          >
            Назад
          </button>
        )}
        <button
          onClick={() => {
            if (isLast) {
              onComplete();
            } else {
              setStep(step + 1);
            }
          }}
          className="flex-1 py-3.5 rounded-xl bg-[#fbbf24] text-[#08080f] font-bold text-sm cursor-pointer border-none"
        >
          {isLast ? "Начать анализ" : "Далее"}
        </button>
      </div>

      {/* Скип */}
      {!isLast && (
        <button
          onClick={onComplete}
          className="mt-3 bg-transparent border-none text-[#4b5563] text-xs cursor-pointer"
        >
          Пропустить
        </button>
      )}
    </div>
  );
}
