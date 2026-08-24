export interface ReviewDto {
  id: string;
  productId: string;
  productName?: string;
  rating: number;
  title: string | null;
  body: string;
  isVerified: boolean;
  helpfulCount: number;
  authorName: string;
  createdAt: string;
}

export interface WishlistItemDto {
  id: string;
  productId: string;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    primaryImage: string | null;
  };
  createdAt: string;
}

export interface RewardAccountDto {
  balance: number;
  lifetime: number;
  transactions: Array<{
    id: string;
    points: number;
    type: string;
    note: string | null;
    createdAt: string;
  }>;
}

export interface AffiliateDto {
  code: string;
  status: string;
  commissionRate: number;
  referralUrl: string;
  pending: number;
  paid: number;
  commissions: Array<{
    id: string;
    orderId: string;
    amount: number;
    status: string;
    createdAt: string;
  }>;
}

export interface ReturnRequestDto {
  id: string;
  orderNumber: string;
  status: string;
  reason: string;
  note: string | null;
  createdAt: string;
  items: Array<{
    id: string;
    productName: string;
    quantity: number;
  }>;
}

export interface PaymentDto {
  id: string;
  orderNumber: string;
  amount: number;
  status: string;
  method: string;
  gateway: string | null;
  transactionId: string | null;
  createdAt: string;
}

export interface SavedPaymentMethodDto {
  id: string;
  provider: string;
  brand: string | null;
  lastFour: string;
  isDefault: boolean;
}

export interface CmsPageDto {
  id: string;
  title: string;
  slug: string;
  body: string;
  excerpt: string | null;
  updatedAt: string;
}

export interface BlogPostDto {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string;
  coverUrl: string | null;
  publishedAt: string | null;
}

export interface FaqDto {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export interface BannerDto {
  id: string;
  title: string;
  imageUrl: string;
  href: string | null;
  placement: string;
}

export interface MenuDto {
  location: string;
  items: Array<{ label: string; href: string }>;
}

export interface VendorPayoutDto {
  id: string;
  amount: number;
  status: string;
  reference: string | null;
  createdAt: string;
}
