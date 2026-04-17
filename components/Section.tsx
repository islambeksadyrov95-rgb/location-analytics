"use client";

import { useState, type ReactNode } from "react";

interface SectionProps {
  title: string;
  icon: string;
  count?: number | null;
  open?: boolean;
  children: ReactNode;
}

export function Section({ title, icon, count, open: defOpen = false, children }: SectionProps) {
  const [open, setOpen] = useState(defOpen);

  return (
    <div className="mb-1.5">
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex justify-between items-center px-3 py-2.5 bg-[#12121a] border border-[#1e1e2a] cursor-pointer text-[#d1d5db] transition-all ${
          open ? "rounded-t-[10px]" : "rounded-[10px]"
        }`}
      >
        <span className="text-xs font-bold">
          {icon} {title}
          {count != null ? ` (${count})` : ""}
        </span>
        <span
          className={`text-base text-[#4b5563] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          ▾
        </span>
      </button>
      {open && (
        <div className="px-3 pt-2 pb-1.5 bg-[#0c0c14] border border-[#1e1e2a] border-t-0 rounded-b-[10px]">
          {children}
        </div>
      )}
    </div>
  );
}
