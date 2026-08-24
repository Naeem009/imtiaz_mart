import { reindexCatalogSearchAction, reindexVisualSearchAction } from "@/lib/admin/actions";

export function VisualSearchAdmin({
  indexed,
  total,
  engine,
}: {
  indexed?: string;
  total?: string;
  engine?: string;
}) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-surface p-8 shadow-sm">
        <h2 className="text-xl font-semibold text-primary">Image embeddings</h2>
        <p className="mt-3 text-sm leading-7 text-muted">
          Rebuild visual search embeddings for product images. This can take a few minutes on large catalogs.
        </p>
        {indexed && total ? (
          <p className="mt-4 rounded-lg border border-border bg-background px-4 py-3 text-sm text-primary">
            Indexed {indexed} of {total} product images.
          </p>
        ) : null}
        <form action={reindexVisualSearchAction} className="mt-6">
          <button
            type="submit"
            className="rounded-lg bg-cta px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
          >
            Run visual reindex
          </button>
        </form>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-8 shadow-sm">
        <h2 className="text-xl font-semibold text-primary">Catalog search (Elasticsearch)</h2>
        <p className="mt-3 text-sm leading-7 text-muted">
          Reindex products into Elasticsearch. If Elasticsearch is unavailable, search falls back to PostgreSQL.
        </p>
        {indexed && engine ? (
          <p className="mt-4 rounded-lg border border-border bg-background px-4 py-3 text-sm text-primary">
            Indexed {indexed} products via {engine}.
          </p>
        ) : null}
        <form action={reindexCatalogSearchAction} className="mt-6">
          <button
            type="submit"
            className="rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-primary hover:bg-background"
          >
            Run catalog reindex
          </button>
        </form>
      </div>
    </div>
  );
}
