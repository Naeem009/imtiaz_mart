import type {
  AdminCustomerDto,
  AdminOrderDto,
  AdminProductDto,
  AdminSocialOverviewDto,
  AdminStatsDto,
  AdminVendorDto,
  AgentEligibilityProductDto,
  AgentFeedStatusDto,
  PaginatedResponse,
  PlatformSettingsDto,
} from "@imtiaz-mart/shared";
import { authFetchJson } from "@/lib/api/auth-fetch";

export async function fetchAdminStats() {
  return authFetchJson<AdminStatsDto>("/admin/reports");
}

export async function fetchAdminVendors() {
  return authFetchJson<AdminVendorDto[]>("/admin/vendors");
}

export async function fetchAdminOrders(page = 1) {
  return authFetchJson<PaginatedResponse<AdminOrderDto>>(`/admin/orders?page=${page}`);
}

export async function fetchAdminProducts(params: {
  page?: number;
  q?: string;
  status?: string;
} = {}) {
  const search = new URLSearchParams();
  if (params.page && params.page > 1) search.set("page", String(params.page));
  if (params.q) search.set("q", params.q);
  if (params.status) search.set("status", params.status);
  const qs = search.toString();
  return authFetchJson<PaginatedResponse<AdminProductDto>>(
    `/admin/products${qs ? `?${qs}` : ""}`,
  );
}

export async function fetchAdminCustomers(params: { page?: number; q?: string } = {}) {
  const search = new URLSearchParams();
  if (params.page && params.page > 1) search.set("page", String(params.page));
  if (params.q) search.set("q", params.q);
  const qs = search.toString();
  return authFetchJson<PaginatedResponse<AdminCustomerDto>>(
    `/admin/customers${qs ? `?${qs}` : ""}`,
  );
}

export async function fetchAdminSettings() {
  return authFetchJson<PlatformSettingsDto>("/admin/settings");
}

export async function fetchAgentEligibility() {
  return authFetchJson<AgentEligibilityProductDto[]>("/admin/agent-commerce/eligibility");
}

export async function fetchAgentFeedStatus() {
  return authFetchJson<AgentFeedStatusDto>("/admin/agent-commerce/feed-status");
}

export async function fetchAdminSocialOverview() {
  return authFetchJson<AdminSocialOverviewDto>("/admin/store-social/accounts");
}
