export interface AdminVendorDto {
  id: string;
  name: string;
  slug: string;
  isVerified: boolean;
  isActive: boolean;
  rating: number;
  productCount: number;
  orderCount: number;
  ownerEmail: string | null;
  createdAt: string;
  subscriptionTier: string;
}

export interface AdminOrderDto {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  currency: string;
  customerName: string;
  createdAt: string;
  itemCount: number;
}

export interface AdminStatsDto {
  users: number;
  vendors: number;
  products: number;
  orders: number;
  revenue: number;
  pendingVendors: number;
}

export interface AgentEligibilityProductDto {
  id: string;
  name: string;
  slug: string;
  vendorName: string;
  isEligibleSearch: boolean;
  isEligibleCheckout: boolean;
  status: string;
}

export interface AgentFeedStatusDto {
  ucp: { count: number; path: string };
  acp: { count: number; path: string };
  perplexity: { count: number; path: string };
  updatedAt: string;
}

export interface VendorAnalyticsDto {
  products: number;
  activeProducts: number;
  orders: number;
  revenue: number;
  pendingOrders: number;
}

export interface PublicVendorDto {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  rating: number;
  isVerified: boolean;
  productCount: number;
}

export interface SocialAccountDto {
  id: string;
  provider: string;
  providerAccountId: string;
  isActive: boolean;
  scopes: string[];
  connectedAt: string;
}

export interface SocialRuleDto {
  id: string;
  name: string;
  triggers: string[];
  platforms: string[];
  enabled: boolean;
  createdAt: string;
}

export interface SocialQueueItemDto {
  id: string;
  status: string;
  payload: unknown;
  scheduledAt: string | null;
  createdAt: string;
  ruleName: string | null;
}

export interface SocialAnalyticsDto {
  sent: number;
  failed: number;
  queued: number;
  accounts: number;
}

export interface AdminSocialOverviewDto {
  accounts: Array<{
    id: string;
    provider: string;
    providerAccountId: string;
    isActive: boolean;
    vendorName: string;
  }>;
  rules: Array<{
    id: string;
    name: string;
    triggers: string[];
    platforms: string[];
    enabled: boolean;
    vendorName: string;
  }>;
  queue: Array<{
    id: string;
    status: string;
    vendorName: string;
    ruleName: string | null;
    createdAt: string;
  }>;
}

export interface AdminProductDto {
  id: string;
  name: string;
  slug: string;
  status: string;
  price: number;
  stock: number;
  vendorName: string;
  categoryName: string;
  isEligibleSearch: boolean;
  isEligibleCheckout: boolean;
  createdAt: string;
}

export interface AdminCustomerDto {
  id: string;
  email: string;
  name: string;
  roles: string[];
  isActive: boolean;
  orderCount: number;
  createdAt: string;
}

export interface PlatformSettingsDto {
  storeName: string;
  supportEmail: string;
  freeShippingThreshold: number;
  shippingFee: number;
  platformFeeRate: number;
  announcementText: string;
  announcementHref: string;
}
