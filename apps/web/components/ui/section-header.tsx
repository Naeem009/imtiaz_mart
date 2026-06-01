import Link from "next/link";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  href?: string;
  linkLabel?: string;
}

export function SectionHeader({
  title,
  subtitle,
  href,
  linkLabel = "View all",
}: SectionHeaderProps) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-primary sm:text-2xl">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1 text-sm text-muted">{subtitle}</p>
        )}
      </div>
      {href && (
        <Link
          href={href}
          className="shrink-0 text-sm font-medium text-accent hover:underline"
        >
          {linkLabel} →
        </Link>
      )}
    </div>
  );
}
