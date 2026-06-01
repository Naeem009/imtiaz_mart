import Link from "next/link";
import type { HomeBlogPost } from "@/lib/data/homepage";
import { SectionHeader } from "@/components/ui/section-header";

interface BlogSectionProps {
  posts: HomeBlogPost[];
}

export function BlogSection({ posts }: BlogSectionProps) {
  return (
    <section className="bg-surface py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader title="From Our Blog" href="/blog" />
        <div className="grid gap-6 sm:grid-cols-3">
          {posts.map((post) => (
            <article
              key={post.id}
              className="group flex flex-col overflow-hidden rounded-xl border border-border bg-background"
            >
              <Link href={`/blog/${post.slug}`}>
                <div className={`aspect-[16/10] ${post.image}`} />
                <div className="p-5">
                  <span className="text-xs font-medium uppercase tracking-wide text-accent">
                    {post.category}
                  </span>
                  <h3 className="mt-2 font-semibold text-primary group-hover:text-accent">
                    {post.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm text-muted">
                    {post.excerpt}
                  </p>
                  <p className="mt-3 text-xs text-muted">{post.readTime} read</p>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
