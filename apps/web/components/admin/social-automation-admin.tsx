import type { AdminSocialOverviewDto } from "@imtiaz-mart/shared";

export function SocialAutomationAdmin({ overview }: { overview: AdminSocialOverviewDto }) {
  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-primary">Connected accounts</h2>
        <ul className="mt-4 space-y-2">
          {overview.accounts.length === 0 ? (
            <li className="text-sm text-muted">No vendor social accounts connected.</li>
          ) : (
            overview.accounts.map((account) => (
              <li key={account.id} className="rounded-lg border border-border bg-background px-4 py-3 text-sm">
                {account.vendorName} — {account.provider} — {account.providerAccountId} —{" "}
                {account.isActive ? "Active" : "Inactive"}
              </li>
            ))
          )}
        </ul>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-primary">Automation rules</h2>
        <ul className="mt-4 space-y-2">
          {overview.rules.length === 0 ? (
            <li className="text-sm text-muted">No automation rules yet.</li>
          ) : (
            overview.rules.map((rule) => (
              <li key={rule.id} className="rounded-lg border border-border bg-background px-4 py-3">
                <p className="font-medium text-primary">{rule.name}</p>
                <p className="text-sm text-muted">
                  {rule.vendorName} · {rule.platforms.join(", ")} · {rule.enabled ? "Enabled" : "Disabled"}
                </p>
              </li>
            ))
          )}
        </ul>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-primary">Post queue</h2>
        <ul className="mt-4 space-y-2">
          {overview.queue.length === 0 ? (
            <li className="text-sm text-muted">Queue is empty.</li>
          ) : (
            overview.queue.map((item) => (
              <li key={item.id} className="rounded-lg border border-border bg-background px-4 py-3">
                <p className="font-medium text-primary">{item.vendorName}</p>
                <p className="text-sm text-muted">
                  {item.ruleName ?? "Manual"} · {item.status}
                </p>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}
