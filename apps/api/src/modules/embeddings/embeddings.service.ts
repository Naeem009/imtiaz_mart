import { Injectable, Logger } from "@nestjs/common";
import fetch from "node-fetch";

@Injectable()
export class EmbeddingsService {
  private readonly logger = new Logger(EmbeddingsService.name);

  // Dimension for mock embeddings
  private readonly dim = 512;

  private seededVector(text: string) {
    // deterministic pseudo-random vector from string hash
    const seed = this.hashString(text);
    const vec: number[] = new Array(this.dim).fill(0).map((_, i) => {
      const v = Math.sin(seed + i * 12.9898) * 43758.5453;
      return v - Math.floor(v);
    });
    // normalize
    const norm = Math.sqrt(vec.reduce((s, x) => s + x * x, 0));
    return vec.map((v) => v / norm);
  }

  private hashString(s: string) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    return h;
  }

  async embedText(text: string): Promise<number[]> {
    // If OPENAI_API_KEY provided, use OpenAI embeddings
    const key = process.env.OPENAI_API_KEY;
    if (key) {
      try {
        const res = await fetch("https://api.openai.com/v1/embeddings", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
          body: JSON.stringify({ input: text, model: process.env.OPENAI_EMBED_MODEL ?? "text-embedding-3-small" }),
        });
        const j: any = await res.json();
        return j.data?.[0]?.embedding ?? this.seededVector(text);
      } catch (err) {
        this.logger.warn("OpenAI embedding failed, falling back to seeded vector", err as any);
        return this.seededVector(text);
      }
    }

    return this.seededVector(text);
  }

  async embedUrl(url: string): Promise<number[]> {
    // For images, we'll use the URL string as proxy input for embedding when no vision model is configured.
    // If an actual image embedding provider is configured, integrate here.
    const visionKey = process.env.OPENAI_API_KEY;
    if (visionKey && process.env.OPENAI_VISION_MODEL) {
      // Integration point for image->embedding via external provider.
      // Not implemented: fall back to seeded vector.
    }
    return this.seededVector(url);
  }
}
