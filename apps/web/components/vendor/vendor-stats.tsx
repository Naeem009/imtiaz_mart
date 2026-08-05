"use client";

import { useEffect, useState } from "react";
import { siteConfig } from "@/config/site";

export default function VendorStats() {
  const [stats, setStats] = useState<any | null>(null);

  async function load() {
    try {
      const res = await fetch(`${siteConfig.apiUrl}/dashboard/vendor-stats`, { credentials: "include" });
      if (!res.ok) throw new Error(await res.text());
      setStats(await res.json());
    } catch (err) {
      setStats(null);
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (!stats) return <p>No vendor stats available.</p>;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="rounded-2xl border border-border bg-surface p-6">
        <p className="text-sm text-muted">Products</p>
        <p className="mt-2 text-2xl font-semibold">{stats.products}</p>
      </div>
      <div className="rounded-2xl border border-border bg-surface p-6">
        <p className="text-sm text-muted">Orders</p>
        <p className="mt-2 text-2xl font-semibold">{stats.orders}</p>
      </div>
      <div className="rounded-2xl border border-border bg-surface p-6">
        <p className="text-sm text-muted">Revenue</p>
        <p className="mt-2 text-2xl font-semibold">${stats.revenue}</p>
      </div>
    </div>
  );
}
