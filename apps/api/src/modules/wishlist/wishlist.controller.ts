import { Body, Controller, Delete, Get, Param, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { API_VERSION } from "@imtiaz-mart/shared";
import { IsString } from "class-validator";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { JwtPayload } from "@/modules/auth/interfaces/jwt-payload.interface";
import { WishlistService } from "./wishlist.service";

class AddWishlistDto {
  @IsString()
  productId!: string;
}

@ApiTags("wishlist")
@ApiBearerAuth()
@Controller({ path: "customer/wishlist", version: API_VERSION })
export class WishlistController {
  constructor(private wishlist: WishlistService) {}

  @Get()
  @ApiOperation({ summary: "List wishlist items" })
  list(@CurrentUser() user: JwtPayload) {
    return this.wishlist.list(user.sub);
  }

  @Post()
  @ApiOperation({ summary: "Add a product to the wishlist" })
  add(@CurrentUser() user: JwtPayload, @Body() dto: AddWishlistDto) {
    return this.wishlist.add(user.sub, dto.productId);
  }

  @Delete(":productId")
  @ApiOperation({ summary: "Remove a product from the wishlist" })
  remove(@CurrentUser() user: JwtPayload, @Param("productId") productId: string) {
    return this.wishlist.remove(user.sub, productId);
  }
}
