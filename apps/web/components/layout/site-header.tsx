import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { fetchCart } from "@/lib/cart/api";
import { getCompareIds } from "@/lib/compare/cookie";
import { SiteLogo } from "@/components/layout/site-logo";
import { SearchBox } from "@/components/search/search-box";

export async function SiteHeader() {
  const [user, cart, compareIds] = await Promise.all([
    getSession(),
    fetchCart(),
    getCompareIds(),
  ]);
  const cartCount = cart?.itemCount ?? 0;
  const compareCount = compareIds.length;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4 sm:h-16 sm:px-6 lg:px-8">
        <SiteLogo variant="header" priority />

        <div className="relative min-w-0 flex-1 max-w-xl">
          <SearchBox />
        </div>

        <nav className="ml-auto flex items-center gap-3 text-sm sm:gap-5">
          <Link
            href="/shop"
            className="hidden text-muted hover:text-text lg:inline"
          >
            Shop
          </Link>
          <Link
            href="/vendors"
            className="hidden text-muted hover:text-text lg:inline"
          >
            Vendors
          </Link>
          <Link
            href="/deals"
            className="hidden text-muted hover:text-text lg:inline"
          >
            Deals
          </Link>
          <Link
            href="/visual-search"
            className="hidden text-muted hover:text-text lg:inline"
          >
            Visual Search
          </Link>
          <Link
            href="/compare"
            className="relative hidden text-muted hover:text-text lg:inline"
            aria-label={`Compare products${compareCount ? `, ${compareCount} selected` : ""}`}
          >
            Compare
            {compareCount > 0 ? (
              <span className="ml-1 rounded-full bg-accent px-1.5 text-xs font-bold text-white">
                {compareCount}
              </span>
            ) : null}
          </Link>
          <Link
            href="/cart"
            className="relative text-muted hover:text-text"
            aria-label={`Shopping cart${cartCount ? `, ${cartCount} items` : ""}`}
          >
            <span aria-hidden>🛒</span>
            {cartCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-cta px-1 text-xs font-bold text-white">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </Link>
          {user ? (
            <Link
              href="/account"
              className="font-medium text-accent hover:underline"
            >
              Account
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden text-muted hover:text-text sm:inline"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-cta px-3 py-1.5 text-sm font-medium text-white hover:opacity-90 sm:px-4 sm:py-2"
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
