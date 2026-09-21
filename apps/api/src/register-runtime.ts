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

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL =
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL;
}
if (!process.env.DIRECT_URL) {
  process.env.DIRECT_URL =
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.DATABASE_URL;
}

process.env.JWT_SECRET ??= "b616b532ef81f72bf85200ca3526a51e01112e873eb0532028cf915b87763330";
process.env.JWT_REFRESH_SECRET ??= "a75895cb955942bf4d13f5269dbff59b2f309db839fedd8e7581ef7a7aa45523";
process.env.SOCIAL_ENCRYPTION_KEY ??= "59dbc2485c5898012327d18fb68196eaa52ff59983f2b4fd2648f6901828dfa8";

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
