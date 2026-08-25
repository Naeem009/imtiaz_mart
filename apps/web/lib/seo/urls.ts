import { siteConfig } from "@/config/site";

export function siteOrigin(): string {
  return siteConfig.url.replace(/\/$/, "");
}

export function absoluteUrl(path: string): string {
  if (isHttpUrl(path)) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${siteOrigin()}${normalized}`;
}

export function isHttpUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

export function httpUrls(values: Array<string | null | undefined>): string[] {
  return values.filter((value): value is string => Boolean(value && isHttpUrl(value)));
}

export function siteLogoUrl(): string {
  return absoluteUrl(siteConfig.logo.src);
}
