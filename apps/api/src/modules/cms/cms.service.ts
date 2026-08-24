import { Injectable, NotFoundException } from "@nestjs/common";
import type { BannerDto, BlogPostDto, CmsPageDto, FaqDto, MenuDto } from "@imtiaz-mart/shared";
import { v7 as uuidv7 } from "uuid";
import { PrismaService } from "@/modules/prisma/prisma.service";
import { RedisService } from "@/modules/redis/redis.module";

@Injectable()
export class CmsService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async getPage(slug: string): Promise<CmsPageDto> {
    const cacheKey = `cms:page:${slug}`;
    const cached = await this.redis.getJson<CmsPageDto>(cacheKey);
    if (cached) return cached;

    const page = await this.prisma.client.cmsPage.findFirst({
      where: { slug, status: "PUBLISHED" },
    });
    if (!page) throw new NotFoundException("Page not found");
    const dto = this.mapPage(page);
    await this.redis.setJson(cacheKey, dto, 300);
    return dto;
  }

  async listPages(): Promise<CmsPageDto[]> {
    const pages = await this.prisma.client.cmsPage.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { title: "asc" },
    });
    return pages.map((page) => this.mapPage(page));
  }

  async listAllPages(): Promise<CmsPageDto[]> {
    const pages = await this.prisma.client.cmsPage.findMany({
      orderBy: { title: "asc" },
    });
    return pages.map((page) => this.mapPage(page));
  }

  async listPosts(): Promise<BlogPostDto[]> {
    const cached = await this.redis.getJson<BlogPostDto[]>("cms:blogs");
    if (cached) return cached;
    const posts = await this.prisma.client.blogPost.findMany({
      where: { published: true },
      orderBy: { publishedAt: "desc" },
    });
    const dto = posts.map((post) => this.mapPost(post));
    await this.redis.setJson("cms:blogs", dto, 180);
    return dto;
  }

  async getPost(slug: string): Promise<BlogPostDto> {
    const post = await this.prisma.client.blogPost.findFirst({
      where: { slug, published: true },
    });
    if (!post) throw new NotFoundException("Post not found");
    return this.mapPost(post);
  }

  async listFaqs(): Promise<FaqDto[]> {
    const cached = await this.redis.getJson<FaqDto[]>("cms:faqs");
    if (cached) return cached;
    const faqs = await this.prisma.client.faq.findMany({ orderBy: { sortOrder: "asc" } });
    const dto = faqs.map((faq) => ({
      id: faq.id,
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
    }));
    await this.redis.setJson("cms:faqs", dto, 300);
    return dto;
  }

  async listBanners(placement = "home"): Promise<BannerDto[]> {
    const now = new Date();
    const banners = await this.prisma.client.banner.findMany({
      where: {
        active: true,
        placement,
        OR: [{ startsAt: null }, { startsAt: { lte: now } }],
      },
      orderBy: { sortOrder: "asc" },
    });
    return banners
      .filter((banner) => !banner.endsAt || banner.endsAt >= now)
      .map((banner) => ({
        id: banner.id,
        title: banner.title,
        imageUrl: banner.imageUrl,
        href: banner.href,
        placement: banner.placement,
      }));
  }

  async getMenu(location: string): Promise<MenuDto> {
    const menu = await this.prisma.client.menu.findUnique({
      where: { location },
      include: { items: { orderBy: { sortOrder: "asc" } } },
    });
    return {
      location,
      items: (menu?.items ?? []).map((item) => ({ label: item.label, href: item.href })),
    };
  }

  async upsertPage(data: { title: string; slug: string; body: string; excerpt?: string }) {
    const page = await this.prisma.client.cmsPage.upsert({
      where: { slug: data.slug },
      create: {
        id: uuidv7(),
        title: data.title,
        slug: data.slug,
        body: data.body,
        excerpt: data.excerpt,
      },
      update: {
        title: data.title,
        body: data.body,
        excerpt: data.excerpt,
      },
    });
    await this.redis.del(`cms:page:${data.slug}`);
    return this.mapPage(page);
  }

  private mapPage(page: {
    id: string;
    title: string;
    slug: string;
    body: string;
    excerpt: string | null;
    updatedAt: Date;
  }): CmsPageDto {
    return {
      id: page.id,
      title: page.title,
      slug: page.slug,
      body: page.body,
      excerpt: page.excerpt,
      updatedAt: page.updatedAt.toISOString(),
    };
  }

  private mapPost(post: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    body: string;
    coverUrl: string | null;
    publishedAt: Date | null;
  }): BlogPostDto {
    return {
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      body: post.body,
      coverUrl: post.coverUrl,
      publishedAt: post.publishedAt?.toISOString() ?? null,
    };
  }
}
