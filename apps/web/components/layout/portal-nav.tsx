import Link from "next/link";

interface PortalNavProps {
  current: string;
  links: Array<{ href: string; label: string }>;
}

export function PortalNav({ current, links }: PortalNavProps) {
  return (
    <nav className="mt-6 flex flex-wrap gap-2">
      {links.map((link) => {
        const active = current === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-lg px-3 py-2 text-sm font-medium ${
              active
                ? "bg-accent text-white"
                : "border border-border bg-background text-primary hover:bg-muted/40"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

export const vendorNav = [
  { href: "/vendor", label: "Dashboard" },
  { href: "/vendor/products", label: "Products" },
  { href: "/vendor/orders", label: "Orders" },
  { href: "/vendor/analytics", label: "Analytics" },
  { href: "/vendor/social-automation", label: "Social" },
  { href: "/vendor/payouts", label: "Payouts" },
];

export const adminNav = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/vendors", label: "Vendors" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/agent-commerce", label: "Agent feeds" },
  { href: "/admin/payments", label: "Payments" },
  { href: "/admin/returns", label: "Returns" },
  { href: "/admin/cms", label: "CMS" },
  { href: "/admin/settings", label: "Settings" },
  { href: "/admin/visual-search", label: "Visual search" },
  { href: "/admin/social-automation", label: "Social" },
];
