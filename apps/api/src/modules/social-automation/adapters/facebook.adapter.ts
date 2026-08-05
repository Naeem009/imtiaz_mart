import { decryptText } from "@/lib/crypto";

export class FacebookAdapter {
  constructor(private prismaClient: any) {}

  async publish(account: any, payload: { productId: string; productUrl?: string; imageUrl?: string; title?: string }) {
    // account contains encrypted accessToken/refreshToken
    const accessToken = account?.accessToken ? decryptText(account.accessToken) : null;

    // In production: call Facebook Graph API with the accessToken to post to page
    // Here we return a stubbed response
    const fakeId = `fb_${Date.now()}`;
    return { platformPostId: fakeId, response: { ok: true } };
  }
}
