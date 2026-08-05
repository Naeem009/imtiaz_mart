export * from "./facebook.adapter";

export function getAdapter(platform: string) {
  switch ((platform || "").toLowerCase()) {
    case "facebook":
    case "instagram":
      return require("./facebook.adapter").FacebookAdapter;
    case "tiktok":
      return require("./tiktok.adapter").TikTokAdapter;
    default:
      return null;
  }
}
