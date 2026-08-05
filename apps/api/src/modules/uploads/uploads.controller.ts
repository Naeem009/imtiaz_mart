import { Controller, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import * as path from "path";
import { v4 as uuidv4 } from "uuid";
import { UploadsService } from "./uploads.service";

@Controller({ path: "uploads", version: "1" })
export class UploadsController {
  constructor(private uploads: UploadsService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination: (req: any, file: any, cb: (err: any, destination: string) => void) => {
          try {
            const dir = path.join(process.cwd(), "apps", "web", "public", "uploads");
            cb(null, dir);
          } catch (err) {
            cb(err, "");
          }
        },
        filename: (req: any, file: any, cb: (err: any, filename: string) => void) => {
          const ext = path.extname(file.originalname) || "";
          const name = `${Date.now()}-${uuidv4()}${ext}`;
          cb(null, name);
        },
      }),
    }),
  )
  async upload(@UploadedFile() file: any) {
    if (!file) return { url: null };
    const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/uploads/${file.filename}`;
    return { url: publicUrl };
  }
}
