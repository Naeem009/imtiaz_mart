import Link from "next/link";

const links = [
  { href: "/account", label: "Profile" },
  { href: "/account/orders", label: "Orders" },
  { href: "/account/addresses", label: "Addresses" },
];

export function AccountNav({ active }: { active: string }) {
  return (
    <nav className="flex flex-wrap gap-2 border-b border-border pb-4">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            active === link.href
              ? "bg-accent/10 text-accent"
              : "text-muted hover:bg-surface hover:text-text"
          }`}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
