import { existsSync } from "fs";
import Module from "module";
import path from "path";
import { config as loadDotenv } from "dotenv";

function loadEnv(filePath: string) {
  if (!existsSync(filePath)) return;
  loadDotenv({ path: filePath });
}

const cwd = process.cwd();
const here = __dirname;
for (const file of [
  path.join(here, "../.env.production"),
  path.join(here, "../.env"),
  path.join(cwd, ".env.production"),
  path.join(cwd, ".env"),
  path.join(cwd, "../../.env.production"),
]) {
  loadEnv(file);
}

const nodeModule = Module as unknown as {
  _resolveFilename: (
    request: string,
    parent: NodeModule,
    isMain: boolean,
    options: unknown,
  ) => string;
};
const original = nodeModule._resolveFilename.bind(Module);
nodeModule._resolveFilename = function resolveWithAliases(
  request: string,
  parent: NodeModule,
  isMain: boolean,
  options: unknown,
) {
  if (request.startsWith("@/")) {
    request = path.join(here, request.slice(2));
  }
  return original(request, parent, isMain, options);
};

if (process.env.NODE_ENV === "production") {
  process.env.APP_URL ??= "https://imtiaz-mart.vercel.app";
  process.env.API_URL ??= "https://imtiaz-mart-api.vercel.app";
  process.env.CORS_ORIGIN ??= "https://imtiaz-mart.vercel.app";
  process.env.NEXT_PUBLIC_APP_URL ??= process.env.APP_URL;
}
