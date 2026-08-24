import { redirect } from "next/navigation";
import { getSession } from "./session";

export const VENDOR_ROLES = ["vendor", "vendor_staff"] as const;
export const ADMIN_ROLES = ["admin", "super_admin"] as const;

export async function requireRoles(
  allowed: readonly string[],
  path: string,
) {
  const user = await getSession();
  if (!user) {
    redirect(`/login?redirect=${encodeURIComponent(path)}`);
  }

  const roles = user.roles ?? [];
  if (!allowed.some((role) => roles.includes(role))) {
    redirect("/account");
  }

  return user;
}
