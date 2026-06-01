"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { siteConfig } from "@/config/site";
import type { HeroSlide } from "@/lib/data/homepage";

interface HeroSliderProps {
  slides: HeroSlide[];
}

export function HeroSlider({ slides }: HeroSliderProps) {
  const [active, setActive] = useState(0);

  const next = useCallback(() => {
    setActive((i) => (i + 1) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <section
      className="relative overflow-hidden"
      aria-label="Featured promotions"
      aria-roledescription="carousel"
    >
      <div className="relative aspect-[16/7] min-h-[280px] sm:aspect-[16/6] sm:min-h-[360px] lg:aspect-[16/5]">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${slides.length}`}
            className={`absolute inset-0 bg-gradient-to-br ${slide.gradient} transition-opacity duration-700 ${
              index === active ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            <div className="mx-auto flex h-full max-w-7xl flex-col justify-center px-6 sm:px-10 lg:px-12">
              <p className="text-sm font-medium uppercase tracking-widest text-white/80">
                {siteConfig.name}
              </p>
              <h1 className="mt-2 max-w-xl text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                {slide.title}
              </h1>
              <p className="mt-3 max-w-md text-base text-white/90 sm:text-lg">
                {slide.subtitle}
              </p>
              <div className="mt-8">
                <Link
                  href={slide.href}
                  className="inline-flex h-12 items-center rounded-lg bg-cta px-8 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                >
                  {slide.cta}
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => setActive(index)}
            className={`h-2 rounded-full transition-all ${
              index === active
                ? "w-8 bg-white"
                : "w-2 bg-white/50 hover:bg-white/80"
            }`}
            aria-label={`Go to slide ${index + 1}`}
            aria-current={index === active}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={() => setActive((i) => (i - 1 + slides.length) % slides.length)}
        className="absolute left-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-black/20 p-2 text-white backdrop-blur hover:bg-black/40 sm:block"
        aria-label="Previous slide"
      >
        ‹
      </button>
      <button
        type="button"
        onClick={next}
        className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-black/20 p-2 text-white backdrop-blur hover:bg-black/40 sm:block"
        aria-label="Next slide"
      >
        ›
      </button>
    </section>
  );
}
