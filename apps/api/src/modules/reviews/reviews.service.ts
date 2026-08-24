import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ProductStatus } from "@imtiaz-mart/database";
import type { ReviewDto } from "@imtiaz-mart/shared";
import { v7 as uuidv7 } from "uuid";
import { PrismaService } from "@/modules/prisma/prisma.service";
import { CustomersService } from "@/modules/customers/customers.service";
import { RedisService } from "@/modules/redis/redis.module";
import { CreateReviewDto } from "./dto/create-review.dto";

@Injectable()
export class ReviewsService {
  constructor(
    private prisma: PrismaService,
    private customers: CustomersService,
    private redis: RedisService,
  ) {}

  async listForProduct(slug: string): Promise<ReviewDto[]> {
    const product = await this.prisma.client.product.findFirst({
      where: { slug, deletedAt: null, status: ProductStatus.ACTIVE },
    });
    if (!product) throw new NotFoundException("Product not found");

    const cacheKey = `reviews:product:${product.id}`;
    const cached = await this.redis.getJson<ReviewDto[]>(cacheKey);
    if (cached) return cached;

    const reviews = await this.prisma.client.review.findMany({
      where: { productId: product.id },
      include: {
        customer: { include: { user: true } },
        votes: true,
      },
      orderBy: { createdAt: "desc" },
    });
    const mapped = reviews.map((review) => this.map(review, product.name));
    await this.redis.setJson(cacheKey, mapped, 60);
    return mapped;
  }

  async listForCustomer(userId: string): Promise<ReviewDto[]> {
    const customer = await this.customers.ensureCustomer(userId);
    const reviews = await this.prisma.client.review.findMany({
      where: { customerId: customer.id },
      include: {
        product: true,
        customer: { include: { user: true } },
        votes: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return reviews.map((review) => this.map(review, review.product.name));
  }

  async create(userId: string, dto: CreateReviewDto): Promise<ReviewDto> {
    const customer = await this.customers.ensureCustomer(userId);
    const product = await this.prisma.client.product.findFirst({
      where: { id: dto.productId, deletedAt: null },
    });
    if (!product) throw new NotFoundException("Product not found");

    const purchased = await this.prisma.client.orderItem.findFirst({
      where: {
        productId: product.id,
        order: {
          customerId: customer.id,
          status: { in: ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"] },
        },
      },
    });

    try {
      const review = await this.prisma.client.review.create({
        data: {
          id: uuidv7(),
          productId: product.id,
          customerId: customer.id,
          orderId: purchased?.orderId,
          rating: dto.rating,
          title: dto.title,
          body: dto.body,
          isVerified: Boolean(purchased),
        },
        include: { customer: { include: { user: true } }, votes: true },
      });

      await this.recomputeProductRating(product.id);
      await this.redis.del(`reviews:product:${product.id}`, `catalog:product:${product.slug}`);
      return this.map(review, product.name);
    } catch {
      throw new ConflictException("You have already reviewed this product");
    }
  }

  async vote(userId: string, reviewId: string, helpful: boolean) {
    const customer = await this.customers.ensureCustomer(userId);
    const review = await this.prisma.client.review.findUnique({ where: { id: reviewId } });
    if (!review) throw new NotFoundException("Review not found");
    if (review.customerId === customer.id) {
      throw new BadRequestException("You cannot vote on your own review");
    }

    await this.prisma.client.reviewVote.upsert({
      where: { reviewId_customerId: { reviewId, customerId: customer.id } },
      create: { id: uuidv7(), reviewId, customerId: customer.id, helpful },
      update: { helpful },
    });
    await this.redis.del(`reviews:product:${review.productId}`);
    return { ok: true };
  }

  private async recomputeProductRating(productId: string) {
    const agg = await this.prisma.client.review.aggregate({
      where: { productId },
      _avg: { rating: true },
      _count: { _all: true },
    });
    await this.prisma.client.product.update({
      where: { id: productId },
      data: {
        rating: agg._avg.rating ?? 0,
        reviewCount: agg._count._all,
      },
    });
  }

  private map(
    review: {
      id: string;
      productId: string;
      rating: number;
      title: string | null;
      body: string;
      isVerified: boolean;
      createdAt: Date;
      votes: { helpful: boolean }[];
      customer: { user: { firstName: string | null; lastName: string | null; email: string } };
    },
    productName?: string,
  ): ReviewDto {
    const name = [review.customer.user.firstName, review.customer.user.lastName]
      .filter(Boolean)
      .join(" ");
    return {
      id: review.id,
      productId: review.productId,
      productName,
      rating: review.rating,
      title: review.title,
      body: review.body,
      isVerified: review.isVerified,
      helpfulCount: review.votes.filter((vote) => vote.helpful).length,
      authorName: name || review.customer.user.email.split("@")[0],
      createdAt: review.createdAt.toISOString(),
    };
  }
}
