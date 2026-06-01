"use client";

import { useEffect, useState } from "react";

interface FlashSaleTimerProps {
  endsAt: string;
}

export function FlashSaleTimer({ endsAt }: FlashSaleTimerProps) {
  const [left, setLeft] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    const end = new Date(endsAt).getTime();
    const tick = () => {
      const diff = Math.max(0, end - Date.now());
      setLeft({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  return (
    <div className="flex items-center gap-2 text-white" aria-live="polite">
      <TimeBlock value={left.h} label="Hrs" />
      <span className="text-xl font-bold">:</span>
      <TimeBlock value={left.m} label="Min" />
      <span className="text-xl font-bold">:</span>
      <TimeBlock value={left.s} label="Sec" />
    </div>
  );
}

function TimeBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center rounded-lg bg-black/20 px-3 py-2 backdrop-blur">
      <span className="text-2xl font-bold tabular-nums">
        {String(value).padStart(2, "0")}
      </span>
      <span className="text-xs uppercase text-white/80">{label}</span>
    </div>
  );
}
