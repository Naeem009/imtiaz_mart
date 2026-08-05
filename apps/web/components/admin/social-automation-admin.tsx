"use client";

import { useEffect, useState } from "react";
import { siteConfig } from "@/config/site";

export default function SocialAutomationAdmin() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [aRes, rRes] = await Promise.all([
        fetch(`${siteConfig.apiUrl}/social/accounts`, { credentials: "include" }),
        fetch(`${siteConfig.apiUrl}/social/rules`, { credentials: "include" }),
      ]);
      if (aRes.ok) setAccounts(await aRes.json());
      if (rRes.ok) setRules(await rRes.json());
    } catch (err) {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleConnect() {
    // For now, a simple prompt-based connect flow (placeholder for OAuth)
    const provider = prompt("Provider (e.g. facebook, instagram):");
    const providerAccountId = prompt("Provider account id (placeholder):");
    if (!provider || !providerAccountId) return;
    const resp = await fetch(`${siteConfig.apiUrl}/social/connect`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ provider, providerAccountId, scopes: ["publish"] }),
    });
    if (resp.ok) load();
    else alert(await resp.text());
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Social Automation</h2>
      <div className="flex gap-3">
        <button onClick={handleConnect} className="rounded bg-cta px-4 py-2 text-white">Connect Account</button>
        <button onClick={load} className="rounded border px-4 py-2">Refresh</button>
      </div>

      <section>
        <h3 className="font-semibold">Connected Accounts</h3>
        {loading ? <p className="text-sm text-muted">Loading…</p> : null}
        <ul className="space-y-2 mt-2">
          {accounts.map((a) => (
            <li key={a.id} className="rounded p-3 border">{a.provider} — {a.providerAccountId} — {a.isActive ? 'Active' : 'Inactive'}</li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="font-semibold">Automation Rules</h3>
        <ul className="space-y-2 mt-2">
          {rules.map((r) => (
            <li key={r.id} className="rounded p-3 border flex items-center justify-between">
              <div>
                <div className="font-medium">{r.name}</div>
                <div className="text-sm text-muted">Triggers: {r.triggers?.join(", ")}</div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    const res = await fetch(`${siteConfig.apiUrl}/social/rules/${r.id}/trigger`, { method: "POST", credentials: "include" });
                    if (res.ok) alert("Triggered");
                    else alert(await res.text());
                  }}
                  className="rounded bg-cta px-3 py-1 text-white"
                >
                  Run Now
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
