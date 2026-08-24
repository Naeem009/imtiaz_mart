import Link from "next/link";
import type { BlogPostDto } from "@imtiaz-mart/shared";
import { SectionHeader } from "@/components/ui/section-header";
import { coverFromSlug, isHttpUrl } from "@/lib/home/palette";

interface BlogSectionProps {
  posts: BlogPostDto[];
}

export function BlogSection({ posts }: BlogSectionProps) {
  if (posts.length === 0) return null;

  return (
    <section className="bg-surface py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader title="From Our Blog" href="/blog" />
        <div className="grid gap-6 sm:grid-cols-3">
          {posts.map((post) => {
            const cover = post.coverUrl?.trim() ?? "";
            const remote = isHttpUrl(cover);
            const surface =
              cover.startsWith("bg-") || cover.startsWith("from-")
                ? cover.startsWith("from-")
                  ? `bg-gradient-to-br ${cover}`
                  : cover
                : coverFromSlug(post.slug);
            const published = post.publishedAt
              ? new Date(post.publishedAt).toLocaleDateString("en-PK", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : null;

            return (
              <article
                key={post.id}
                className="group flex flex-col overflow-hidden rounded-xl border border-border bg-background"
              >
                <Link href={`/blog/${post.slug}`}>
                  <div
                    className={`aspect-[16/10] ${remote ? "bg-slate-200" : surface}`}
                    style={
                      remote
                        ? {
                            backgroundImage: `url(${cover})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }
                        : undefined
                    }
                  />
                  <div className="p-5">
                    {published ? (
                      <span className="text-xs font-medium uppercase tracking-wide text-accent">
                        {published}
                      </span>
                    ) : null}
                    <h3 className="mt-2 font-semibold text-primary group-hover:text-accent">
                      {post.title}
                    </h3>
                    {post.excerpt ? (
                      <p className="mt-2 line-clamp-2 text-sm text-muted">
                        {post.excerpt}
                      </p>
                    ) : null}
                  </div>
                </Link>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
