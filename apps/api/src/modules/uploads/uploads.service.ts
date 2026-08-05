import { Injectable } from "@nestjs/common";
import * as path from "path";
import * as fs from "fs";

@Injectable()
export class UploadsService {
  public uploadDir() {
    return path.join(process.cwd(), "apps", "web", "public", "uploads");
  }

  ensureUploadDir() {
    const dir = this.uploadDir();
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    return dir;
  }
}
