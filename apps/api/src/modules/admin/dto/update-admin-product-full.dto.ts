import { PartialType } from "@nestjs/swagger";
import { CreateAdminProductDto } from "./create-admin-product.dto";

export class UpdateAdminProductFullDto extends PartialType(CreateAdminProductDto) {}
