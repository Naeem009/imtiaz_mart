import Link from "next/link";

interface PaginationProps {
  page: number;
  totalPages: number;
  basePath: string;
  query?: Record<string, string | undefined>;
}

export function Pagination({
  page,
  totalPages,
  basePath,
  query = {},
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const hrefFor = (p: number) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  return (
    <nav className="mt-10 flex justify-center gap-2" aria-label="Pagination">
      {page > 1 && (
        <Link
          href={hrefFor(page - 1)}
          className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-surface"
        >
          Previous
        </Link>
      )}
      <span className="flex items-center px-4 text-sm text-muted">
        Page {page} of {totalPages}
      </span>
      {page < totalPages && (
        <Link
          href={hrefFor(page + 1)}
          className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-surface"
        >
          Next
        </Link>
      )}
    </nav>
  );
}
