import { ShopShell } from "@/components/layout/shop-shell";
import { fetchFaqs } from "@/lib/commerce/api";

export const metadata = { title: "FAQ" };

export default async function FaqPage() {
  const faqs = await fetchFaqs();

  return (
    <ShopShell>
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <h1 className="text-3xl font-bold text-primary">Frequently asked questions</h1>
        <div className="mt-8 space-y-4">
          {faqs.length === 0 ? (
            <p className="text-sm text-muted">FAQs will appear after the CMS is seeded.</p>
          ) : (
            faqs.map((faq) => (
              <details key={faq.id} className="rounded-xl border border-border bg-surface p-5">
                <summary className="cursor-pointer font-medium text-primary">{faq.question}</summary>
                <p className="mt-3 text-sm leading-7 text-muted">{faq.answer}</p>
              </details>
            ))
          )}
        </div>
      </div>
    </ShopShell>
  );
}
