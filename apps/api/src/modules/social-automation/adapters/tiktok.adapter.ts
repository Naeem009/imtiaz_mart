export class TikTokAdapter {
  constructor(private prismaClient: any) {}

  async publish(account: any, payload: any) {
    // Stub: replace with real TikTok Business API publish call
    const fakeId = `tiktok_${Date.now()}`;
    return { platformPostId: fakeId, response: { ok: true } };
  }
}
