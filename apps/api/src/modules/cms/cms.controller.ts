import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { API_VERSION } from "@imtiaz-mart/shared";
import { IsEmail, IsOptional, IsString, MinLength } from "class-validator";
import { Public } from "@/common/decorators/public.decorator";
import { Roles } from "@/common/decorators/roles.decorator";
import { CmsService } from "./cms.service";

class UpsertPageDto {
  @IsString()
  @MinLength(2)
  title!: string;

  @IsString()
  @MinLength(2)
  slug!: string;

  @IsString()
  @MinLength(10)
  body!: string;

  @IsOptional()
  @IsString()
  excerpt?: string;
}

class SubscribeNewsletterDto {
  @IsEmail()
  email!: string;
}

@ApiTags("cms")
@Controller({ version: API_VERSION })
export class CmsController {
  constructor(private cms: CmsService) {}

  @Public()
  @Get("pages")
  @ApiOperation({ summary: "List published CMS pages" })
  pages() {
    return this.cms.listPages();
  }

  @Public()
  @Get("pages/:slug")
  @ApiOperation({ summary: "Get a CMS page" })
  page(@Param("slug") slug: string) {
    return this.cms.getPage(slug);
  }

  @Public()
  @Get("blogs")
  @ApiOperation({ summary: "List blog posts" })
  blogs() {
    return this.cms.listPosts();
  }

  @Public()
  @Get("blogs/:slug")
  @ApiOperation({ summary: "Get a blog post" })
  blog(@Param("slug") slug: string) {
    return this.cms.getPost(slug);
  }

  @Public()
  @Get("faqs")
  @ApiOperation({ summary: "List FAQs" })
  faqs() {
    return this.cms.listFaqs();
  }

  @Public()
  @Get("banners")
  @ApiOperation({ summary: "List active banners" })
  banners(@Query("placement") placement?: string) {
    return this.cms.listBanners(placement ?? "home");
  }

  @Public()
  @Get("menus/:location")
  @ApiOperation({ summary: "Get a navigation menu" })
  menu(@Param("location") location: string) {
    return this.cms.getMenu(location);
  }

  @Public()
  @Post("newsletter")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Subscribe an email to marketplace updates" })
  subscribe(@Body() dto: SubscribeNewsletterDto) {
    return this.cms.subscribeNewsletter(dto.email);
  }

  @ApiBearerAuth()
  @Roles("admin", "super_admin")
  @Get("admin/cms/pages")
  @ApiOperation({ summary: "List all CMS pages" })
  adminPages() {
    return this.cms.listAllPages();
  }

  @ApiBearerAuth()
  @Roles("admin", "super_admin")
  @Post("admin/cms/pages")
  @ApiOperation({ summary: "Create or update a CMS page" })
  upsert(@Body() dto: UpsertPageDto) {
    return this.cms.upsertPage(dto);
  }
}
