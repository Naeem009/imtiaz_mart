import type { HomeVideoReview } from "@/lib/data/homepage";
import { SectionHeader } from "@/components/ui/section-header";

interface VideoReviewsSectionProps {
  videos: HomeVideoReview[];
}

export function VideoReviewsSection({ videos }: VideoReviewsSectionProps) {
  return (
    <section className="bg-surface py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader title="Video Reviews" subtitle="See products in action" />
        <div className="grid gap-4 sm:grid-cols-3">
          {videos.map((video) => (
            <article
              key={video.id}
              className={`group relative aspect-video overflow-hidden rounded-xl bg-gradient-to-br ${video.gradient}`}
            >
              <button
                type="button"
                className="absolute inset-0 flex items-center justify-center"
                aria-label={`Play video: ${video.title}`}
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-2xl text-primary shadow-lg transition-transform group-hover:scale-110">
                  ▶
                </span>
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <h3 className="text-sm font-semibold text-white">{video.title}</h3>
                <p className="text-xs text-white/80">
                  {video.author} · {video.duration}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
