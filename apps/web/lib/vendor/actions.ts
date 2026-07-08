"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { registerVendorApi } from "./api";

export async function registerVendorAction(formData: FormData) {
  const result = await registerVendorApi({
    storeName: formData.get("storeName") as string,
    description: (formData.get("description") as string) || undefined,
  });

  if (!result) {
    redirect("/vendor/register?error=Could+not+create+vendor+account");
  }

  revalidatePath("/account");
  redirect("/account");
}
