"use client";

import { useEffect, useState } from "react";
import { siteConfig } from "@/config/site";

export default function SocialAutomationSettings() {
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newName, setNewName] = useState("");

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`${siteConfig.apiUrl}/social/rules`, { credentials: "include" });
      if (res.ok) setRules(await res.json());
    } catch (err) {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function createRule() {
    if (!newName) return;
    const dto = { name: newName, triggers: ["Manual"], platforms: ["facebook","instagram","tiktok"], config: { autoPublish: true, maxPerDay: 72 } };
    const res = await fetch(`${siteConfig.apiUrl}/social/rules`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(dto) });
    if (res.ok) {
      setNewName("");
      load();
    } else {
      alert(await res.text());
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Social Automation Settings</h2>
      <div className="rounded border p-4">
        <label className="block">
          <span className="text-sm text-muted">New rule name</span>
          <input value={newName} onChange={(e) => setNewName(e.target.value)} className="mt-2 w-full rounded border px-3 py-2" />
        </label>
        <div className="mt-3 flex gap-2">
          <button onClick={createRule} className="rounded bg-cta px-4 py-2 text-white">Create Rule</button>
          <button onClick={load} className="rounded border px-4 py-2">Refresh</button>
        </div>
      </div>

      <section>
        <h3 className="font-semibold">Your Rules</h3>
        {loading ? <p>Loading…</p> : null}
        <ul className="space-y-2 mt-3">
          {rules.map((r) => (
            <li key={r.id} className="rounded p-3 border flex items-center justify-between">
              <div>
                <div className="font-medium">{r.name}</div>
                <div className="text-sm text-muted">Platforms: {(r.platforms || []).join(", ")}</div>
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
