"use client";

import { useEffect, useState } from "react";
import { siteConfig } from "@/config/site";

export default function DashboardStats() {
  const [stats, setStats] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`${siteConfig.apiUrl}/dashboard/admin-stats`);
      if (!res.ok) throw new Error(await res.text());
      setStats(await res.json());
    } catch (err) {
      setStats(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) return <p>Loading…</p>;
  if (!stats) return <p>No stats available.</p>;

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <div className="rounded-2xl border border-border bg-surface p-6">
        <p className="text-sm text-muted">Users</p>
        <p className="mt-2 text-2xl font-semibold">{stats.users}</p>
      </div>
      <div className="rounded-2xl border border-border bg-surface p-6">
        <p className="text-sm text-muted">Vendors</p>
        <p className="mt-2 text-2xl font-semibold">{stats.vendors}</p>
      </div>
      <div className="rounded-2xl border border-border bg-surface p-6">
        <p className="text-sm text-muted">Products</p>
        <p className="mt-2 text-2xl font-semibold">{stats.products}</p>
      </div>
      <div className="rounded-2xl border border-border bg-surface p-6">
        <p className="text-sm text-muted">Orders</p>
        <p className="mt-2 text-2xl font-semibold">{stats.orders}</p>
      </div>
    </div>
  );
}
