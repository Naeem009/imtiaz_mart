import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { CompareBar } from "@/components/product/compare-bar";
import { getCompareIds } from "@/lib/compare/cookie";

export async function ShopShell({ children }: { children: React.ReactNode }) {
  const compareCount = (await getCompareIds()).length;

  return (
    <div
      className={`flex min-h-full flex-col ${compareCount > 0 ? "pb-36 md:pb-24" : "pb-16 md:pb-0"}`}
    >
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <CompareBar />
    </div>
  );
}
