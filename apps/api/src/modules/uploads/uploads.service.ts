import { Injectable, NotFoundException } from "@nestjs/common";
import * as path from "path";
import * as fs from "fs";
import { v7 as uuidv7 } from "uuid";
import { PrismaService } from "@/modules/prisma/prisma.service";
import { VendorsService } from "@/modules/vendors/vendors.service";

@Injectable()
export class UploadsService {
  constructor(private prisma: PrismaService, private vendors: VendorsService) {}

  public uploadDir() {
    return path.join(process.cwd(), "uploads");
  }

  ensureUploadDir() {
    const dir = this.uploadDir();
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    return dir;
  }

  async attachProductImage(userId: string, productId: string, file: Express.Multer.File) {
    const vendor = await this.vendors.resolveVendorForUser(userId);
    const product = await this.prisma.client.product.findFirst({
      where: { id: productId, vendorId: vendor.id, deletedAt: null },
    });
    if (!product) {
      if (file?.path) fs.rmSync(file.path, { force: true });
      throw new NotFoundException("Product not found");
    }

    const image = await this.prisma.client.$transaction(async (tx) => {
      await tx.productImage.updateMany({
        where: { productId, isPrimary: true },
        data: { isPrimary: false },
      });
      return tx.productImage.create({
        data: {
          id: uuidv7(),
          productId,
          url: `${process.env.API_URL ?? "http://localhost:3001"}/uploads/${file.filename}`,
          alt: product.name,
          isPrimary: true,
          sortOrder: 0,
        },
      });
    });

    return { id: image.id, url: image.url, isPrimary: image.isPrimary };
  }
}
