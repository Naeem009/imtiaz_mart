import { notFound } from "next/navigation";
import { ShopShell } from "@/components/layout/shop-shell";
import { fetchBlog } from "@/lib/commerce/api";

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await fetchBlog(slug);
  if (!post) notFound();

  return (
    <ShopShell>
      <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <h1 className="text-3xl font-bold text-primary">{post.title}</h1>
        <p className="mt-3 text-muted">{post.excerpt}</p>
        <div className="mt-8 whitespace-pre-line text-sm leading-7 text-primary">{post.body}</div>
      </article>
    </ShopShell>
  );
}
