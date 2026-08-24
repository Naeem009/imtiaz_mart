"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { authMutateJson } from "@/lib/api/auth-fetch";

function fail(path: string, error: string): never {
  redirect(`${path}?error=${encodeURIComponent(error)}`);
}

export async function updateVendorStatusAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const result = await authMutateJson(`/admin/vendors/${id}`, {
    method: "PATCH",
    body: JSON.stringify({
      isVerified: formData.get("isVerified") === "true",
      isActive: formData.get("isActive") === "true",
    }),
  });

  if ("error" in result) {
    fail("/admin/vendors", result.error);
  }

  revalidatePath("/admin/vendors");
  revalidatePath("/admin");
  redirect("/admin/vendors");
}

export async function updateEligibilityAction(formData: FormData) {
  const productId = String(formData.get("productId") ?? "");
  const result = await authMutateJson(`/admin/agent-commerce/eligibility/${productId}`, {
    method: "PATCH",
    body: JSON.stringify({
      isEligibleSearch: formData.get("isEligibleSearch") === "on",
      isEligibleCheckout: formData.get("isEligibleCheckout") === "on",
    }),
  });

  if ("error" in result) {
    fail("/admin/agent-commerce", result.error);
  }

  revalidatePath("/admin/agent-commerce");
  redirect("/admin/agent-commerce");
}

export async function reindexVisualSearchAction() {
  const result = await authMutateJson<{ indexed: number; total: number }>(
    "/admin/visual-search/reindex",
    { method: "POST" },
  );

  if ("error" in result) {
    fail("/admin/visual-search", result.error);
  }

  revalidatePath("/admin/visual-search");
  redirect(
    `/admin/visual-search?indexed=${result.data.indexed}&total=${result.data.total}`,
  );
}

export async function reindexCatalogSearchAction() {
  const result = await authMutateJson<{ indexed: number; engine: string }>(
    "/admin/search/reindex",
    { method: "POST" },
  );

  if ("error" in result) {
    fail("/admin/visual-search", result.error);
  }

  revalidatePath("/admin/visual-search");
  redirect(
    `/admin/visual-search?indexed=${result.data.indexed}&engine=${result.data.engine}`,
  );
}

export async function markPaymentPaidAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const result = await authMutateJson(`/admin/payments/${id}/paid`, { method: "PATCH" });
  if ("error" in result) fail("/admin/payments", result.error);
  revalidatePath("/admin/payments");
  redirect("/admin/payments");
}

export async function updateReturnStatusAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  const result = await authMutateJson(`/admin/returns/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  if ("error" in result) fail("/admin/returns", result.error);
  revalidatePath("/admin/returns");
  redirect("/admin/returns");
}

export async function upsertCmsPageAction(formData: FormData) {
  const result = await authMutateJson("/admin/cms/pages", {
    method: "POST",
    body: JSON.stringify({
      title: String(formData.get("title") ?? ""),
      slug: String(formData.get("slug") ?? ""),
      body: String(formData.get("body") ?? ""),
      excerpt: String(formData.get("excerpt") ?? "") || undefined,
    }),
  });
  if ("error" in result) fail("/admin/cms", result.error);
  revalidatePath("/admin/cms");
  revalidatePath("/pages");
  redirect("/admin/cms");
}
