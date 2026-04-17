"use client";

interface Props {
  progress: number;
  stage: string;
}

export function SearchProgress({ progress, stage }: Props) {
  const size = 160;
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center py-16">
      {/* Круговой прогресс */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Фон */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#1e1e2a"
            strokeWidth={stroke}
          />
          {/* Прогресс */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#f59e0b"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-500 ease-out"
          />
        </svg>
        {/* Процент в центре */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl font-black text-white">{Math.round(progress)}%</span>
        </div>
      </div>

      {/* Текст этапа */}
      <p className="mt-6 text-sm text-[#9ca3af] text-center max-w-xs animate-pulse">
        {stage}
      </p>

      {/* Этапы */}
      <div className="mt-8 w-full max-w-xs space-y-2">
        <StageItem label="Поиск объявлений на Крыше" done={progress >= 20} active={progress > 0 && progress < 20} />
        <StageItem label="Загрузка деталей объявлений" done={progress >= 50} active={progress >= 20 && progress < 50} />
        <StageItem label="Анализ конкурентов (2ГИС)" done={progress >= 80} active={progress >= 50 && progress < 80} />
        <StageItem label="Расчёт скоринга" done={progress >= 95} active={progress >= 80 && progress < 95} />
        <StageItem label="Готово" done={progress >= 100} active={progress >= 95 && progress < 100} />
      </div>
    </div>
  );
}

function StageItem({ label, done, active }: { label: string; done: boolean; active: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 transition-colors ${
          done
            ? "bg-[#22c55e] text-white"
            : active
              ? "bg-[#f59e0b]/20 text-[#f59e0b] animate-pulse"
              : "bg-[#1e1e2a] text-[#4b5563]"
        }`}
      >
        {done ? "✓" : active ? "●" : "○"}
      </div>
      <span
        className={`text-xs transition-colors ${
          done ? "text-[#9ca3af]" : active ? "text-white font-semibold" : "text-[#4b5563]"
        }`}
      >
        {label}
      </span>
    </div>
  );
}
