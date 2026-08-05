import { ShopShell } from "@/components/layout/shop-shell";
import { VisualSearchPanel } from "@/components/visual-search/visual-search-panel";

export const metadata = {
  title: "Visual Search",
  description: "Search products by image or keyword.",
};

export default function VisualSearchPage() {
  return (
    <ShopShell>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <VisualSearchPanel />
      </div>
    </ShopShell>
  );
}
