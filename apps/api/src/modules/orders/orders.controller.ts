import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Req,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Request } from "express";
import { API_VERSION } from "@imtiaz-mart/shared";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { JwtPayload } from "@/modules/auth/interfaces/jwt-payload.interface";
import { CreateOrderDto } from "./dto/create-order.dto";
import { OrdersService } from "./orders.service";

@ApiTags("orders")
@ApiBearerAuth()
@Controller({ path: "orders", version: API_VERSION })
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post("create")
  @ApiOperation({ summary: "Create order from cart" })
  create(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateOrderDto,
    @Headers("x-cart-session") sessionId: string | undefined,
  ) {
    return this.ordersService.create(user.sub, sessionId, dto);
  }

  @Get()
  @ApiOperation({ summary: "List my orders" })
  list(@CurrentUser() user: JwtPayload) {
    return this.ordersService.listForCustomer(user.sub);
  }

  @Get("track/:orderNumber")
  @ApiOperation({ summary: "Track order by order number" })
  track(
    @CurrentUser() user: JwtPayload,
    @Param("orderNumber") orderNumber: string,
  ) {
    return this.ordersService.findByOrderNumber(user.sub, orderNumber);
  }
}
