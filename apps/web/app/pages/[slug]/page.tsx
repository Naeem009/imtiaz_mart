import type { Metadata } from "next";
import { ShopShell } from "@/components/layout/shop-shell";
import { JsonLd } from "@/components/seo/json-ld";
import { fetchCmsPage } from "@/lib/commerce/api";
import { webPageJsonLd } from "@/lib/seo/json-ld";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await fetchCmsPage(slug);
  return {
    title: page?.title ?? "Page",
    description: page?.excerpt ?? undefined,
    alternates: { canonical: `/pages/${slug}` },
  };
}

export default async function CmsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await fetchCmsPage(slug);
  if (!page) notFound();

  return (
    <ShopShell>
      <JsonLd data={webPageJsonLd(page)} />
      <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-accent">ATVOO</p>
        <h1 className="mt-2 text-3xl font-bold text-primary">{page.title}</h1>
        {page.excerpt ? <p className="mt-3 text-muted">{page.excerpt}</p> : null}
        <div className="mt-8 whitespace-pre-line text-sm leading-7 text-primary">{page.body}</div>
      </article>
    </ShopShell>
  );
}
