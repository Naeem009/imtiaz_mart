import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { API_VERSION } from "@imtiaz-mart/shared";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { Public } from "@/common/decorators/public.decorator";
import { JwtPayload } from "@/modules/auth/interfaces/jwt-payload.interface";
import { CreateReviewDto } from "./dto/create-review.dto";
import { ReviewsService } from "./reviews.service";

@ApiTags("reviews")
@Controller({ version: API_VERSION })
export class ReviewsController {
  constructor(private reviews: ReviewsService) {}

  @Public()
  @Get("products/:slug/reviews")
  @ApiOperation({ summary: "List reviews for a product" })
  listProduct(@Param("slug") slug: string) {
    return this.reviews.listForProduct(slug);
  }

  @ApiBearerAuth()
  @Get("customer/reviews")
  @ApiOperation({ summary: "List my reviews" })
  mine(@CurrentUser() user: JwtPayload) {
    return this.reviews.listForCustomer(user.sub);
  }

  @ApiBearerAuth()
  @Post("customer/reviews")
  @ApiOperation({ summary: "Write a product review" })
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateReviewDto) {
    return this.reviews.create(user.sub, dto);
  }

  @ApiBearerAuth()
  @Post("customer/reviews/:id/vote")
  @ApiOperation({ summary: "Mark a review as helpful" })
  vote(@CurrentUser() user: JwtPayload, @Param("id") id: string) {
    return this.reviews.vote(user.sub, id, true);
  }
}
