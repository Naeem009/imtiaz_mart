import Link from "next/link";
import { siteConfig } from "@/config/site";

const footerLinks = {
  shop: [
    { label: "All Products", href: "/shop" },
    { label: "Categories", href: "/categories" },
    { label: "Brands", href: "/brands" },
    { label: "Deals", href: "/deals" },
    { label: "Flash Sale", href: "/deals/flash-sale" },
  ],
  company: [
    { label: "About Us", href: "/about" },
    { label: "Careers", href: "/careers" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/contact" },
  ],
  support: [
    { label: "Help Center", href: "/help" },
    { label: "Track Order", href: "/track-order" },
    { label: "Returns", href: "/returns" },
    { label: "FAQ", href: "/faq" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms & Conditions", href: "/terms" },
    { label: "Shipping Policy", href: "/shipping" },
    { label: "Refund Policy", href: "/refund" },
  ],
};

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-primary text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-1">
            <Link href="/" className="text-xl font-bold">
              {siteConfig.name}
            </Link>
            <p className="mt-4 text-sm text-white/70">
              Pakistan&apos;s premium multi-vendor marketplace. Shop trusted
              vendors, fast delivery, secure checkout.
            </p>
          </div>
          <FooterColumn title="Shop" links={footerLinks.shop} />
          <FooterColumn title="Company" links={footerLinks.company} />
          <FooterColumn title="Support" links={footerLinks.support} />
          <FooterColumn title="Legal" links={footerLinks.legal} />
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-sm text-white/60">
            &copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-white/60">
            <Link href="/vendor/register" className="hover:text-white">
              Sell on {siteConfig.name}
            </Link>
            <Link href="/affiliate" className="hover:text-white">
              Affiliate Program
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold uppercase tracking-wider text-white/90">
        {title}
      </h3>
      <ul className="mt-4 space-y-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm text-white/70 transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
