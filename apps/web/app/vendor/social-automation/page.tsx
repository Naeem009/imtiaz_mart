import { redirect } from "next/navigation";
import { ShopShell } from "@/components/layout/shop-shell";
import { getSession } from "@/lib/auth/session";
import SocialAutomationSettings from "@/components/vendor/social-automation-settings";

export const metadata = { title: "Social Automation" };

export default async function VendorSocialAutomationPage() {
  const user = await getSession();
  if (!user) redirect("/login?redirect=/vendor/social-automation");

  const roles = user.roles ?? [];
  const isVendor = roles.includes("vendor") || roles.includes("vendor_staff");
  if (!isVendor) redirect("/account");

  return (
    <ShopShell>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <SocialAutomationSettings />
      </div>
    </ShopShell>
  );
}
