import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { OptionalJwtAuthGuard } from "@/common/guards/optional-jwt.guard";
import { ApiHeader, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Request } from "express";
import { API_VERSION } from "@imtiaz-mart/shared";
import { Public } from "@/common/decorators/public.decorator";
import { JwtPayload } from "@/modules/auth/interfaces/jwt-payload.interface";
import { CartService } from "./cart.service";
import { AddCartItemDto } from "./dto/add-cart-item.dto";
import { UpdateCartItemDto } from "./dto/update-cart-item.dto";

@ApiTags("cart")
@UseGuards(OptionalJwtAuthGuard)
@Controller({ path: "cart", version: API_VERSION })
export class CartController {
  constructor(private cartService: CartService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: "Get current cart" })
  @ApiHeader({ name: "X-Cart-Session", required: false })
  getCart(
    @Headers("x-cart-session") sessionId: string | undefined,
    @Req() req: Request & { user?: JwtPayload },
  ) {
    return this.cartService.getCart(this.identity(req, sessionId));
  }

  @Public()
  @Post("items")
  @ApiOperation({ summary: "Add item to cart" })
  addItem(
    @Body() dto: AddCartItemDto,
    @Headers("x-cart-session") sessionId: string | undefined,
    @Req() req: Request & { user?: JwtPayload },
  ) {
    return this.cartService.addItem(
      this.identity(req, sessionId),
      dto.variantId,
      dto.quantity,
    );
  }

  @Public()
  @Patch("items/:itemId")
  updateItem(
    @Param("itemId") itemId: string,
    @Body() dto: UpdateCartItemDto,
    @Headers("x-cart-session") sessionId: string | undefined,
    @Req() req: Request & { user?: JwtPayload },
  ) {
    return this.cartService.updateItem(
      this.identity(req, sessionId),
      itemId,
      dto.quantity,
    );
  }

  @Public()
  @Delete("items/:itemId")
  removeItem(
    @Param("itemId") itemId: string,
    @Headers("x-cart-session") sessionId: string | undefined,
    @Req() req: Request & { user?: JwtPayload },
  ) {
    return this.cartService.removeItem(this.identity(req, sessionId), itemId);
  }

  @Public()
  @Delete()
  clearCart(
    @Headers("x-cart-session") sessionId: string | undefined,
    @Req() req: Request & { user?: JwtPayload },
  ) {
    return this.cartService.clearCart(this.identity(req, sessionId));
  }

  private identity(
    req: Request & { user?: JwtPayload },
    sessionId?: string,
  ) {
    return {
      userId: req.user?.sub,
      sessionId,
    };
  }
}
