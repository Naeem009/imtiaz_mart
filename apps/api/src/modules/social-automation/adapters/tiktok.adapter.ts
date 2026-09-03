export class TikTokAdapter {
  constructor(private prismaClient: any) {}

  async publish(_account: any, _payload: any) {
    // Stub: replace with real TikTok Business API publish call
    const fakeId = `tiktok_${Date.now()}`;
    return { platformPostId: fakeId, response: { ok: true } };
  }
}
