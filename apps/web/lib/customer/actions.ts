"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAddressApi, deleteAddressApi } from "./api";

export async function createAddressAction(formData: FormData) {
  const result = await createAddressApi({
    label: (formData.get("label") as string) || "Home",
    line1: formData.get("line1") as string,
    line2: (formData.get("line2") as string) || null,
    city: formData.get("city") as string,
    state: (formData.get("state") as string) || null,
    postalCode: formData.get("postalCode") as string,
    country: (formData.get("country") as string) || "PK",
    phone: (formData.get("phone") as string) || null,
    isDefault: formData.get("isDefault") === "on",
  });

  if (!result) {
    redirect("/account/addresses?error=Could+not+save+address");
  }

  revalidatePath("/account/addresses");
  revalidatePath("/checkout");
  redirect("/account/addresses");
}

export async function deleteAddressAction(formData: FormData) {
  const id = formData.get("id") as string;
  await deleteAddressApi(id);
  revalidatePath("/account/addresses");
  revalidatePath("/checkout");
}
