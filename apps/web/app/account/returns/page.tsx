import { redirect } from "next/navigation";
import { AccountShell } from "@/components/layout/account-shell";
import { getSession } from "@/lib/auth/session";
import { fetchMyReturns } from "@/lib/commerce/api";

export const metadata = { title: "Returns" };

export default async function AccountReturnsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await getSession();
  if (!user) redirect("/login?redirect=/account/returns");
  const { error } = await searchParams;
  const returns = await fetchMyReturns();

  return (
    <AccountShell active="/account/returns" title="Returns">
      {error ? <p className="mb-4 rounded-lg bg-error/10 px-4 py-3 text-sm text-error">{error}</p> : null}
      {returns.length === 0 ? (
        <p className="text-muted">No return requests yet. Open an order to start a return after it ships.</p>
      ) : (
        <ul className="space-y-3">
          {returns.map((item) => (
            <li key={item.id} className="rounded-xl border border-border bg-surface p-5">
              <p className="font-medium text-primary">#{item.orderNumber}</p>
              <p className="mt-1 text-sm text-muted">{item.status} · {item.reason}</p>
            </li>
          ))}
        </ul>
      )}
    </AccountShell>
  );
}
