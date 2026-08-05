import { decryptText } from "@/lib/crypto";

const GRAPH_BASE = "https://graph.facebook.com";
// Recommended env vars to configure Facebook App behavior
// Set your app credentials in the environment:
// - FACEBOOK_APP_ID
// - FACEBOOK_APP_SECRET

export class FacebookAdapter {
  constructor(private prismaClient: any) {}

  /**
   * Publish a product post to Facebook Page or Instagram Business account.
   * Requirements:
   * - `account.provider` should be either "facebook" (for Page) or "instagram" (for IG business).
   * - `account.providerAccountId` should be the Facebook Page ID (for facebook) or the Instagram Business User ID (for instagram).
   *   If you prefer to hardcode a page id, set it in the `providerAccountId` when creating the account record.
   * - `account.accessToken` must be present and encrypted (we decrypt using `decryptText`).
   *
   * NOTE: This implementation assumes `account.accessToken` is a Page access token (for Pages) or a valid token for IG publishing.
   * If you only have a user access token, exchange it for a long-lived Page token per Facebook docs.
   */
  async publish(account: any, payload: { productId: string; productUrl?: string; imageUrl?: string; title?: string }) {
    if (!account) throw new Error("No social account provided");

    const encrypted = account.accessToken as string | undefined;
    if (!encrypted) throw new Error("No access token stored for social account");

    const accessToken = decryptText(encrypted);

    const provider = (account.provider || "").toLowerCase();
    const providerAccountId = account.providerAccountId; // expected to be the page ID or IG business user id

    if (!providerAccountId) {
      // Mark location where to input page id if not stored on account
      // TODO: set `providerAccountId` when connecting the account (this is the Page ID or IG Business User ID).
      throw new Error("providerAccountId (page or instagram user id) is required on the account record");
    }

    if (provider === "facebook") {
      // Post photo to Facebook Page using image URL and caption.
      // Endpoint: POST /{page-id}/photos with `url` and `caption` fields and a Page access token.
      const pageId = providerAccountId;
      const captionParts = [payload.title, payload.productUrl].filter(Boolean);
      const caption = captionParts.join("\n\n");

      const url = `${GRAPH_BASE}/v17.0/${encodeURIComponent(pageId)}/photos`;
      const body = new URLSearchParams();
      if (payload.imageUrl) body.append("url", payload.imageUrl);
      body.append("caption", caption);
      body.append("access_token", accessToken);

      const res = await fetch(url, { method: "POST", body });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(JSON.stringify(json));
      }

      // json.id is the photo id on Facebook; you can build a permalink if needed
      return { platformPostId: json.id, response: json };
    }

    if (provider === "instagram") {
      // Instagram publishing via the Graph API requires an Instagram Business Account ID.
      // High-level flow:
      // 1) POST /{ig-user-id}/media { image_url, caption, access_token } => returns { id: creation_id }
      // 2) POST /{ig-user-id}/media_publish { creation_id, access_token } => returns { id: insta_post_id }
      const igUserId = providerAccountId;
      const captionParts = [payload.title, payload.productUrl].filter(Boolean);
      const caption = captionParts.join("\n\n");

      const createUrl = `${GRAPH_BASE}/v17.0/${encodeURIComponent(igUserId)}/media`;
      const createBody = new URLSearchParams();
      if (payload.imageUrl) createBody.append("image_url", payload.imageUrl);
      createBody.append("caption", caption);
      createBody.append("access_token", accessToken);

      const createRes = await fetch(createUrl, { method: "POST", body: createBody });
      const createJson = await createRes.json();
      if (!createRes.ok) throw new Error(JSON.stringify(createJson));

      const creationId = createJson.id;
      const publishUrl = `${GRAPH_BASE}/v17.0/${encodeURIComponent(igUserId)}/media_publish`;
      const publishBody = new URLSearchParams();
      publishBody.append("creation_id", creationId);
      publishBody.append("access_token", accessToken);

      const publishRes = await fetch(publishUrl, { method: "POST", body: publishBody });
      const publishJson = await publishRes.json();
      if (!publishRes.ok) throw new Error(JSON.stringify(publishJson));

      return { platformPostId: publishJson.id, response: publishJson };
    }

    // Unknown provider — return skipped
    return { platformPostId: null, response: { skipped: true } };
  }
}
