import type {
  SocialAccountDto,
  SocialAnalyticsDto,
  SocialQueueItemDto,
  SocialRuleDto,
} from "@imtiaz-mart/shared";
import {
  approveSocialQueueAction,
  connectSocialAccountAction,
  createSocialRuleAction,
  generateSocialPostAction,
  rejectSocialQueueAction,
  triggerSocialRuleAction,
} from "@/lib/vendor/actions";

interface SocialAutomationSettingsProps {
  accounts: SocialAccountDto[];
  rules: SocialRuleDto[];
  queue: SocialQueueItemDto[];
  analytics: SocialAnalyticsDto | null;
  draft?: string;
}

export function SocialAutomationSettings({
  accounts,
  rules,
  queue,
  analytics,
  draft,
}: SocialAutomationSettingsProps) {
  return (
    <div className="space-y-8">
      {analytics ? (
        <div className="grid gap-4 sm:grid-cols-4">
          <Stat label="Connected accounts" value={analytics.accounts} />
          <Stat label="Queued posts" value={analytics.queued} />
          <Stat label="Sent" value={analytics.sent} />
          <Stat label="Failed" value={analytics.failed} />
        </div>
      ) : null}

      <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-primary">Connect an account</h2>
        <p className="mt-2 text-sm text-muted">
          Store a platform page ID for Facebook, Instagram, or TikTok. OAuth tokens can be added later.
        </p>
        <form action={connectSocialAccountAction} className="mt-4 grid gap-4 sm:grid-cols-2">
          <input
            name="provider"
            required
            placeholder="facebook"
            className="rounded-lg border border-border bg-background px-4 py-2.5 text-sm"
          />
          <input
            name="providerAccountId"
            required
            placeholder="Page or account ID"
            className="rounded-lg border border-border bg-background px-4 py-2.5 text-sm"
          />
          <button
            type="submit"
            className="rounded-lg bg-cta px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 sm:col-span-2"
          >
            Connect account
          </button>
        </form>
        <ul className="mt-4 space-y-2">
          {accounts.length === 0 ? (
            <li className="text-sm text-muted">No social accounts connected yet.</li>
          ) : (
            accounts.map((account) => (
              <li key={account.id} className="rounded-lg border border-border bg-background px-4 py-3 text-sm">
                {account.provider} — {account.providerAccountId} — {account.isActive ? "Active" : "Inactive"}
              </li>
            ))
          )}
        </ul>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-primary">Automation rules</h2>
        <form action={createSocialRuleAction} className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            name="name"
            required
            placeholder="New arrivals to Facebook"
            className="flex-1 rounded-lg border border-border bg-background px-4 py-2.5 text-sm"
          />
          <button
            type="submit"
            className="rounded-lg bg-cta px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
          >
            Create rule
          </button>
        </form>
        <ul className="mt-4 space-y-2">
          {rules.length === 0 ? (
            <li className="text-sm text-muted">No rules yet. Growth plan or higher is required.</li>
          ) : (
            rules.map((rule) => (
              <li
                key={rule.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-background px-4 py-3"
              >
                <div>
                  <p className="font-medium text-primary">{rule.name}</p>
                  <p className="text-sm text-muted">
                    {rule.platforms.join(", ")} · {rule.enabled ? "Enabled" : "Disabled"}
                  </p>
                </div>
                <form action={triggerSocialRuleAction}>
                  <input type="hidden" name="id" value={rule.id} />
                  <button
                    type="submit"
                    className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-primary hover:bg-muted/40"
                  >
                    Run now
                  </button>
                </form>
              </li>
            ))
          )}
        </ul>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-primary">Approval queue</h2>
        <ul className="mt-4 space-y-2">
          {queue.length === 0 ? (
            <li className="text-sm text-muted">No queued posts.</li>
          ) : (
            queue.map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-background px-4 py-3"
              >
                <div>
                  <p className="font-medium text-primary">{item.ruleName ?? "Manual post"}</p>
                  <p className="text-sm text-muted">{item.status}</p>
                </div>
                {item.status === "PENDING" ? (
                  <div className="flex gap-2">
                    <form action={approveSocialQueueAction}>
                      <input type="hidden" name="id" value={item.id} />
                      <button type="submit" className="rounded-lg bg-cta px-3 py-1.5 text-sm font-semibold text-white">
                        Approve
                      </button>
                    </form>
                    <form action={rejectSocialQueueAction}>
                      <input type="hidden" name="id" value={item.id} />
                      <button
                        type="submit"
                        className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-primary"
                      >
                        Reject
                      </button>
                    </form>
                  </div>
                ) : null}
              </li>
            ))
          )}
        </ul>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-primary">Generate a draft caption</h2>
        <form action={generateSocialPostAction} className="mt-4 space-y-3">
          <input
            name="productId"
            placeholder="Optional product ID"
            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm"
          />
          <button
            type="submit"
            className="rounded-lg bg-cta px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
          >
            Generate draft
          </button>
        </form>
        {draft ? (
          <p className="mt-4 rounded-lg border border-border bg-background px-4 py-3 text-sm text-primary">{draft}</p>
        ) : null}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-6">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-primary">{value}</p>
    </div>
  );
}
