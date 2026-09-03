import { BadRequestException, Controller, Param, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import * as path from "path";
import { v4 as uuidv4 } from "uuid";
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { Roles } from "@/common/decorators/roles.decorator";
import { JwtPayload } from "@/modules/auth/interfaces/jwt-payload.interface";
import { UploadsService } from "./uploads.service";
import * as fs from "fs";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

function uploadDir() {
  const dir = path.join(process.cwd(), "uploads");
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

@ApiTags("uploads")
@Controller({ path: "uploads", version: "1" })
export class UploadsController {
  constructor(private uploads: UploadsService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination: (req: any, file: any, cb: (err: any, destination: string) => void) => {
          try {
            cb(null, uploadDir());
          } catch (err) {
            cb(err, "");
          }
        },
        filename: (req: any, file: any, cb: (err: any, filename: string) => void) => {
          const ext = path.extname(file.originalname).toLowerCase();
          const name = `${Date.now()}-${uuidv4()}${ext}`;
          cb(null, name);
        },
      }),
      limits: { fileSize: MAX_FILE_SIZE, files: 1 },
      fileFilter: (req: any, file: any, cb: (err: Error | null, accepted: boolean) => void) => {
        cb(null, ALLOWED_IMAGE_TYPES.includes(file.mimetype));
      },
    }),
  )
  async upload(@UploadedFile() file: any) {
    if (!file) throw new BadRequestException("A valid image file is required");
    const publicUrl = `${process.env.API_URL ?? "http://localhost:3001"}/uploads/${file.filename}`;
    return { url: publicUrl };
  }

  @Post("product/:productId")
  @Roles("vendor", "vendor_staff")
  @ApiBearerAuth()
  @ApiConsumes("multipart/form-data")
  @ApiOperation({ summary: "Upload a primary product image" })
  @UseInterceptors(FileInterceptor("file", { storage: diskStorage({
    destination: (req: any, file: any, cb: any) => cb(null, uploadDir()),
    filename: (req: any, file: any, cb: any) => cb(null, `${Date.now()}-${uuidv4()}${path.extname(file.originalname).toLowerCase()}`),
  }), limits: { fileSize: MAX_FILE_SIZE, files: 1 }, fileFilter: (req: any, file: any, cb: any) => cb(null, ALLOWED_IMAGE_TYPES.includes(file.mimetype)) }))
  uploadProductImage(
    @CurrentUser() user: JwtPayload,
    @Param("productId") productId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException("A valid image file is required");
    return this.uploads.attachProductImage(user.sub, productId, file);
  }
}
