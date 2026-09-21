import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ProductStatus } from "@imtiaz-mart/database";
import type { ProductAnswerDto, ProductQuestionDto } from "@imtiaz-mart/shared";
import { v7 as uuidv7 } from "uuid";
import { PrismaService } from "@/modules/prisma/prisma.service";
import { CustomersService } from "@/modules/customers/customers.service";
import { RedisService } from "@/modules/redis/redis.module";
import { CreateQuestionDto } from "./dto/create-question.dto";

const questionInclude = {
  customer: { include: { user: true } },
  answers: {
    include: { user: true },
    orderBy: { createdAt: "asc" as const },
  },
};

@Injectable()
export class QuestionsService {
  constructor(
    private prisma: PrismaService,
    private customers: CustomersService,
    private redis: RedisService,
  ) {}

  async listForProduct(slug: string): Promise<ProductQuestionDto[]> {
    const product = await this.prisma.client.product.findFirst({
      where: { slug, deletedAt: null, status: ProductStatus.ACTIVE },
    });
    if (!product) throw new NotFoundException("Product not found");

    const cacheKey = `questions:product:${product.id}`;
    const cached = await this.redis.getJson<ProductQuestionDto[]>(cacheKey);
    if (cached) return cached;

    const questions = await this.prisma.client.productQuestion.findMany({
      where: { productId: product.id },
      include: questionInclude,
      orderBy: { createdAt: "desc" },
    });
    const mapped = questions.map((question) => this.mapQuestion(question));
    await this.redis.setJson(cacheKey, mapped, 60);
    return mapped;
  }

  async create(userId: string, dto: CreateQuestionDto): Promise<ProductQuestionDto> {
    const customer = await this.customers.ensureCustomer(userId);
    const product = await this.prisma.client.product.findFirst({
      where: { id: dto.productId, deletedAt: null, status: ProductStatus.ACTIVE },
    });
    if (!product) throw new NotFoundException("Product not found");

    const question = await this.prisma.client.productQuestion.create({
      data: {
        id: uuidv7(),
        productId: product.id,
        customerId: customer.id,
        body: dto.body.trim(),
      },
      include: questionInclude,
    });
    await this.redis.del(`questions:product:${product.id}`);
    return this.mapQuestion(question);
  }

  async answer(
    userId: string,
    questionId: string,
    body: string,
  ): Promise<ProductQuestionDto> {
    const question = await this.prisma.client.productQuestion.findUnique({
      where: { id: questionId },
      include: {
        product: true,
        customer: true,
      },
    });
    if (!question) throw new NotFoundException("Question not found");
    if (question.customer.userId === userId) {
      throw new BadRequestException("You cannot answer your own question");
    }

    const fromVendor = await this.isVendorForProduct(userId, question.product.vendorId);
    await this.prisma.client.productAnswer.create({
      data: {
        id: uuidv7(),
        questionId: question.id,
        userId,
        body: body.trim(),
        fromVendor,
      },
    });

    await this.redis.del(`questions:product:${question.productId}`);
    const updated = await this.prisma.client.productQuestion.findUniqueOrThrow({
      where: { id: question.id },
      include: questionInclude,
    });
    return this.mapQuestion(updated);
  }

  private async isVendorForProduct(userId: string, vendorId: string): Promise<boolean> {
    const vendor = await this.prisma.client.vendor.findFirst({
      where: {
        id: vendorId,
        deletedAt: null,
        OR: [{ ownerId: userId }, { staff: { some: { userId } } }],
      },
    });
    return Boolean(vendor);
  }

  private mapQuestion(question: {
    id: string;
    productId: string;
    body: string;
    createdAt: Date;
    customer: { user: { firstName: string | null; lastName: string | null; email: string } };
    answers: Array<{
      id: string;
      body: string;
      fromVendor: boolean;
      createdAt: Date;
      user: { firstName: string | null; lastName: string | null; email: string };
    }>;
  }): ProductQuestionDto {
    return {
      id: question.id,
      productId: question.productId,
      body: question.body,
      authorName: displayName(question.customer.user),
      createdAt: question.createdAt.toISOString(),
      answers: question.answers.map((answer) => ({
        id: answer.id,
        body: answer.body,
        authorName: displayName(answer.user),
        fromVendor: answer.fromVendor,
        createdAt: answer.createdAt.toISOString(),
      })),
    };
  }
}

function displayName(user: {
  firstName: string | null;
  lastName: string | null;
  email: string;
}): string {
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ");
  return name || user.email.split("@")[0];
}
