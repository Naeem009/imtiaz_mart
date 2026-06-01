import Link from "next/link";
import type { HomeProduct } from "@/lib/data/homepage";
import { mapHomeProductToListItem } from "@/lib/catalog/map-home-product";
import { ProductCard } from "@/components/ui/product-card";
import { FlashSaleTimer } from "./flash-sale-timer";

interface FlashSaleSectionProps {
  products: HomeProduct[];
  endsAt: string;
}

export function FlashSaleSection({ products, endsAt }: FlashSaleSectionProps) {

  return (
    <section className="bg-gradient-to-r from-orange-500 to-red-600 py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              ⚡ Flash Sale
            </h2>
            <p className="mt-1 text-white/90">Limited time — grab deals before they&apos;re gone</p>
          </div>
          <FlashSaleTimer endsAt={endsAt} />
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.slice(0, 4).map((product) => (
            <div key={product.id} className="rounded-xl bg-white p-3 shadow-lg">
              <ProductCard product={mapHomeProductToListItem(product)} />
            </div>
          ))}
        </div>
        <div className="mt-6 text-center">
          <Link
            href="/deals/flash-sale"
            className="inline-flex h-11 items-center rounded-lg bg-white px-8 text-sm font-semibold text-cta transition-opacity hover:opacity-90"
          >
            View all flash deals
          </Link>
        </div>
      </div>
    </section>
  );
}
