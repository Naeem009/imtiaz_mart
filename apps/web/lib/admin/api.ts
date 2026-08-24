import type {
  AdminOrderDto,
  AdminSocialOverviewDto,
  AdminStatsDto,
  AdminVendorDto,
  AgentEligibilityProductDto,
  AgentFeedStatusDto,
  PaginatedResponse,
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

export async function fetchAgentEligibility() {
  return authFetchJson<AgentEligibilityProductDto[]>("/admin/agent-commerce/eligibility");
}

export async function fetchAgentFeedStatus() {
  return authFetchJson<AgentFeedStatusDto>("/admin/agent-commerce/feed-status");
}

export async function fetchAdminSocialOverview() {
  return authFetchJson<AdminSocialOverviewDto>("/admin/store-social/accounts");
}
