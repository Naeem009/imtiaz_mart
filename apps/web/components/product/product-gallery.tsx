"use client";

import { useState } from "react";
import type { ProductImageDto } from "@imtiaz-mart/shared";

interface ProductGalleryProps {
  images: ProductImageDto[];
  name: string;
}

export function ProductGallery({ images, name }: ProductGalleryProps) {
  const sorted = [...images].sort(
    (a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0),
  );
  const [active, setActive] = useState(sorted[0]?.id ?? "");

  const current = sorted.find((i) => i.id === active) ?? sorted[0];
  const imageClass = current?.url ?? "bg-slate-200";

  return (
    <div className="space-y-4">
      <div
        className={`aspect-square w-full overflow-hidden rounded-xl ${imageClass.startsWith("bg-") ? imageClass : "bg-surface"}`}
        style={
          current && !current.url.startsWith("bg-")
            ? { backgroundImage: `url(${current.url})`, backgroundSize: "cover" }
            : undefined
        }
        role="img"
        aria-label={current?.alt ?? name}
      />
      {sorted.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {sorted.map((img) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActive(img.id)}
              className={`h-16 w-16 shrink-0 rounded-lg border-2 ${img.id === active ? "border-accent" : "border-border"} ${img.url.startsWith("bg-") ? img.url : "bg-surface"}`}
              aria-label={`View ${img.alt ?? name}`}
              aria-current={img.id === active}
            />
          ))}
        </div>
      )}
    </div>
  );
}
