"use client";

import { useEffect, useState, type ReactNode } from "react";

export function TmaProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        const { init, miniApp, viewport, themeParams } = await import("@telegram-apps/sdk");
        init();

        // Расширяем на полный экран
        if (viewport.mount.isAvailable()) {
          await viewport.mount();
          if (viewport.expand.isAvailable()) {
            viewport.expand();
          }
        }

        // Устанавливаем тёмную тему хедера
        if (miniApp.mount.isAvailable()) {
          await miniApp.mount();
          if (miniApp.setHeaderColor.isAvailable()) {
            miniApp.setHeaderColor("#08080f");
          }
          if (miniApp.setBackgroundColor.isAvailable()) {
            miniApp.setBackgroundColor("#08080f");
          }
        }

        // Биндим тему
        if (themeParams.mount.isAvailable()) {
          await themeParams.mount();
        }
      } catch {
        // Не в Telegram — работаем как обычное веб-приложение
        console.log("Not in Telegram environment, running as web app");
      }
      setReady(true);
    }
    init();
  }, []);

  if (!ready) {
    return (
      <div className="min-h-screen bg-[#08080f] flex items-center justify-center">
        <div className="animate-pulse text-[#fbbf24] text-lg font-bold">Loading...</div>
      </div>
    );
  }

  return <>{children}</>;
}
