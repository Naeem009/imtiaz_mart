"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "Home", icon: "⌂" },
  { href: "/categories", label: "Categories", icon: "▦" },
  { href: "/search", label: "Search", icon: "⌕" },
  { href: "/cart", label: "Cart", icon: "🛒" },
  { href: "/account", label: "Account", icon: "👤" },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background pb-[env(safe-area-inset-bottom)] md:hidden"
      aria-label="Mobile navigation"
    >
      <ul className="flex h-16 items-stretch">
        {items.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <li key={item.href} className="flex flex-1">
              <Link
                href={item.href}
                className={`flex flex-1 flex-col items-center justify-center gap-0.5 text-xs transition-colors ${
                  active
                    ? "font-medium text-accent"
                    : "text-muted hover:text-text"
                }`}
                aria-current={active ? "page" : undefined}
              >
                <span className="text-lg" aria-hidden>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
