import Link from "next/link";
import { ShopShell } from "@/components/layout/shop-shell";
import { fetchBlogs } from "@/lib/commerce/api";

export const metadata = { title: "Blog" };

export default async function BlogPage() {
  const posts = await fetchBlogs();

  return (
    <ShopShell>
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <h1 className="text-3xl font-bold text-primary">Blog</h1>
        <div className="mt-8 space-y-4">
          {posts.length === 0 ? (
            <p className="text-sm text-muted">No posts published yet.</p>
          ) : (
            posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="block rounded-xl border border-border bg-surface p-6 hover:border-accent/60"
              >
                <h2 className="text-lg font-semibold text-primary">{post.title}</h2>
                <p className="mt-2 text-sm text-muted">{post.excerpt}</p>
              </Link>
            ))
          )}
        </div>
      </div>
    </ShopShell>
  );
}
