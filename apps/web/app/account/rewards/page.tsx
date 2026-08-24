import { redirect } from "next/navigation";
import { AccountShell } from "@/components/layout/account-shell";
import { getSession } from "@/lib/auth/session";
import { fetchRewards } from "@/lib/commerce/api";

export const metadata = { title: "Reward points" };

export default async function RewardsPage() {
  const user = await getSession();
  if (!user) redirect("/login?redirect=/account/rewards");
  const rewards = await fetchRewards();

  return (
    <AccountShell active="/account/rewards" title="Reward points">
      {!rewards ? (
        <p className="text-muted">Could not load rewards.</p>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-surface p-6">
              <p className="text-sm text-muted">Balance</p>
              <p className="mt-2 text-3xl font-semibold text-primary">{rewards.balance}</p>
            </div>
            <div className="rounded-xl border border-border bg-surface p-6">
              <p className="text-sm text-muted">Lifetime earned</p>
              <p className="mt-2 text-3xl font-semibold text-primary">{rewards.lifetime}</p>
            </div>
          </div>
          <ul className="space-y-2">
            {rewards.transactions.map((row) => (
              <li key={row.id} className="flex justify-between rounded-lg border border-border px-4 py-3 text-sm">
                <span className="text-muted">{row.note ?? row.type}</span>
                <span className="font-medium text-primary">{row.points > 0 ? `+${row.points}` : row.points}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </AccountShell>
  );
}
