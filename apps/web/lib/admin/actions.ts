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

export async function updateAdminProductAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const result = await authMutateJson(`/admin/products/${id}`, {
    method: "PATCH",
    body: JSON.stringify({
      status: String(formData.get("status") ?? "ACTIVE"),
      isEligibleSearch: formData.get("isEligibleSearch") === "on",
      isEligibleCheckout: formData.get("isEligibleCheckout") === "on",
    }),
  });
  if ("error" in result) fail("/admin/products", result.error);
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  redirect("/admin/products");
}

export async function approveAdminProductAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const result = await authMutateJson(`/admin/products/${id}/approve`, {
    method: "POST",
    body: JSON.stringify({ note: String(formData.get("note") ?? "").trim() || undefined }),
  });
  if ("error" in result) fail("/admin/products", result.error);
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  redirect("/admin/products");
}

export async function rejectAdminProductAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const result = await authMutateJson(`/admin/products/${id}/reject`, {
    method: "POST",
    body: JSON.stringify({ note: String(formData.get("note") ?? "").trim() || undefined }),
  });
  if ("error" in result) fail("/admin/products", result.error);
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function createAdminCategoryAction(formData: FormData) {
  const result = await authMutateJson("/admin/categories", { method: "POST", body: JSON.stringify({
    name: String(formData.get("name") ?? ""), description: String(formData.get("description") ?? "") || undefined,
    imageUrl: String(formData.get("imageUrl") ?? "") || undefined, sortOrder: Number(formData.get("sortOrder") ?? 0),
  }) });
  if ("error" in result) fail("/admin/catalog", result.error);
  revalidatePath("/admin/catalog"); revalidatePath("/categories"); redirect("/admin/catalog");
}

export async function updateAdminCategoryAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const result = await authMutateJson(`/admin/categories/${id}`, { method: "PATCH", body: JSON.stringify({
    name: String(formData.get("name") ?? ""), description: String(formData.get("description") ?? "") || undefined,
    imageUrl: String(formData.get("imageUrl") ?? "") || undefined, sortOrder: Number(formData.get("sortOrder") ?? 0),
  }) });
  if ("error" in result) fail("/admin/catalog", result.error);
  revalidatePath("/admin/catalog"); revalidatePath("/categories"); redirect("/admin/catalog");
}

export async function deleteAdminCategoryAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const result = await authMutateJson(`/admin/categories/${id}`, { method: "DELETE" });
  if ("error" in result) fail("/admin/catalog", result.error);
  revalidatePath("/admin/catalog"); revalidatePath("/categories"); redirect("/admin/catalog");
}

export async function createAdminProductAction(formData: FormData) {
  const result = await authMutateJson("/admin/products", { method: "POST", body: JSON.stringify({
    name: String(formData.get("name") ?? ""), categoryId: String(formData.get("categoryId") ?? ""), vendorId: String(formData.get("vendorId") ?? ""),
    price: Number(formData.get("price") ?? 0), stock: Number(formData.get("stock") ?? 0), status: String(formData.get("status") ?? "DRAFT"),
    shortDescription: String(formData.get("shortDescription") ?? "") || undefined, imageUrl: String(formData.get("imageUrl") ?? "") || undefined,
  }) });
  if ("error" in result) fail("/admin/catalog", result.error);
  revalidatePath("/admin/catalog"); revalidatePath("/shop"); redirect("/admin/catalog");
}

export async function updateAdminProductDetailsAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const result = await authMutateJson(`/admin/products/${id}/details`, { method: "PATCH", body: JSON.stringify({
    name: String(formData.get("name") ?? ""), categoryId: String(formData.get("categoryId") ?? ""), price: Number(formData.get("price") ?? 0),
    stock: Number(formData.get("stock") ?? 0), status: String(formData.get("status") ?? "DRAFT"),
  }) });
  if ("error" in result) fail("/admin/catalog", result.error);
  revalidatePath("/admin/catalog"); revalidatePath("/shop"); redirect("/admin/catalog");
}

export async function deleteAdminProductAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const result = await authMutateJson(`/admin/products/${id}`, { method: "DELETE" });
  if ("error" in result) fail("/admin/catalog", result.error);
  revalidatePath("/admin/catalog"); revalidatePath("/shop"); redirect("/admin/catalog");
}

export async function updateAdminCustomerAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const result = await authMutateJson(`/admin/customers/${id}`, {
    method: "PATCH",
    body: JSON.stringify({
      isActive: formData.get("isActive") === "true",
    }),
  });
  if ("error" in result) fail("/admin/customers", result.error);
  revalidatePath("/admin/customers");
  redirect("/admin/customers");
}

export async function updatePlatformSettingsAction(formData: FormData) {
  const result = await authMutateJson("/admin/settings", {
    method: "PATCH",
    body: JSON.stringify({
      storeName: String(formData.get("storeName") ?? ""),
      supportEmail: String(formData.get("supportEmail") ?? ""),
      freeShippingThreshold: Number(formData.get("freeShippingThreshold") ?? 0),
      shippingFee: Number(formData.get("shippingFee") ?? 0),
      platformFeeRate: Number(formData.get("platformFeeRate") ?? 0),
      announcementText: String(formData.get("announcementText") ?? ""),
      announcementHref: String(formData.get("announcementHref") ?? ""),
    }),
  });
  if ("error" in result) fail("/admin/settings", result.error);
  revalidatePath("/admin/settings");
  redirect("/admin/settings");
}
