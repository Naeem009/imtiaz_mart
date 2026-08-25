import Link from "next/link";
import { fetchCompareProducts } from "@/lib/catalog/fetch";
import { clearCompareAction, removeCompareAction } from "@/lib/compare/actions";
import { getCompareIds } from "@/lib/compare/cookie";

export async function CompareBar() {
  const ids = await getCompareIds();
  if (ids.length === 0) return null;

  const products = await fetchCompareProducts(ids);

  return (
    <div className="fixed bottom-16 left-0 right-0 z-40 border-t border-border bg-background/95 px-4 py-3 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur md:bottom-0">
      <div className="mx-auto flex max-w-7xl items-center gap-3">
        <p className="hidden shrink-0 text-sm font-medium text-primary sm:block">
          Compare ({products.length}/4)
        </p>
        <ul className="flex min-w-0 flex-1 gap-2 overflow-x-auto">
          {products.map((product) => (
            <li
              key={product.id}
              className="flex shrink-0 items-center gap-2 rounded-lg border border-border bg-surface px-2 py-1.5"
            >
              <span className="max-w-[9rem] truncate text-xs text-primary">{product.name}</span>
              <form action={removeCompareAction}>
                <input type="hidden" name="productId" value={product.id} />
                <button
                  type="submit"
                  className="text-xs text-muted hover:text-error"
                  aria-label={`Remove ${product.name} from compare`}
                >
                  ×
                </button>
              </form>
            </li>
          ))}
        </ul>
        <div className="flex shrink-0 items-center gap-2">
          <form action={clearCompareAction}>
            <button type="submit" className="text-xs text-muted hover:text-text">
              Clear
            </button>
          </form>
          <Link
            href="/compare"
            className="rounded-lg bg-cta px-3 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            Compare
          </Link>
        </div>
      </div>
    </div>
  );
}
