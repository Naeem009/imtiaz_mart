import { FacebookAdapter } from "./facebook.adapter";
import { TikTokAdapter } from "./tiktok.adapter";

export * from "./facebook.adapter";
export * from "./tiktok.adapter";

export function getAdapter(platform: string) {
  switch ((platform || "").toLowerCase()) {
    case "facebook":
    case "instagram":
      return FacebookAdapter;
    case "tiktok":
      return TikTokAdapter;
    default:
      return null;
  }
}
