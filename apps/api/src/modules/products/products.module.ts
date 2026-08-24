import { Module } from "@nestjs/common";
import { VisualSearchModule } from "@/modules/visual-search/visual-search.module";
import { ProductsController } from "./products.controller";
import { ProductsService } from "./products.service";

@Module({
  imports: [VisualSearchModule],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
