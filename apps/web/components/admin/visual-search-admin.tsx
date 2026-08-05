"use client";

import { useState } from "react";
import { siteConfig } from "@/config/site";

export default function VisualSearchAdmin() {
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [lastRun, setLastRun] = useState<string | null>(null);

  async function handleReindex() {
    setRunning(true);
    setMessage(null);
    try {
      const res = await fetch(`${siteConfig.apiUrl}/products/visual-search/reindex`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ force: true }),
      });

      const text = await res.text();
      if (!res.ok) throw new Error(text || "Reindex failed");

      setMessage(text || "Reindex completed");
      setLastRun(new Date().toISOString());
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : "Reindex failed");
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Visual Search — Admin</h2>
      <p className="text-sm text-muted">Trigger reindexing of product image embeddings.</p>
      {message ? <div className="rounded p-3 bg-surface text-sm">{message}</div> : null}
      <div className="flex gap-3">
        <button
          onClick={handleReindex}
          disabled={running}
          className="rounded bg-cta px-4 py-2 text-white"
        >
          {running ? "Reindexing…" : "Run Reindex"}
        </button>
        <button
          onClick={() => {
            setMessage(null);
            setLastRun(null);
          }}
          className="rounded border px-4 py-2"
        >
          Clear
        </button>
      </div>
      {lastRun ? <p className="text-sm text-muted">Last run: {lastRun}</p> : null}
    </div>
  );
}
