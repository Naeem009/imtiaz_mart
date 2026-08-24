import { Injectable, Logger } from "@nestjs/common";
import { Client } from "@elastic/elasticsearch";

export interface ProductSearchDocument {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  category: string;
  brand: string | null;
  vendor: string;
  price: number;
  rating: number;
  status: string;
}

@Injectable()
export class ElasticsearchService {
  private readonly logger = new Logger(ElasticsearchService.name);
  private client: Client | null = null;
  readonly index = process.env.ELASTICSEARCH_INDEX ?? "atvoo-products";

  constructor() {
    const node = process.env.ELASTICSEARCH_URL;
    if (!node) {
      this.logger.warn("ELASTICSEARCH_URL is not set — search uses PostgreSQL");
      return;
    }
    this.client = new Client({ node, requestTimeout: 3000 });
  }

  get enabled() {
    return this.client !== null;
  }

  async ensureIndex() {
    if (!this.client) return false;
    try {
      const exists = await this.client.indices.exists({ index: this.index });
      if (!exists) {
        await this.client.indices.create({
          index: this.index,
          mappings: {
            properties: {
              name: { type: "text" },
              slug: { type: "keyword" },
              description: { type: "text" },
              shortDescription: { type: "text" },
              category: { type: "keyword" },
              brand: { type: "keyword" },
              vendor: { type: "keyword" },
              price: { type: "double" },
              rating: { type: "double" },
              status: { type: "keyword" },
            },
          },
        });
      }
      return true;
    } catch (error) {
      this.logger.warn(`Elasticsearch index check failed: ${String(error)}`);
      return false;
    }
  }

  async indexProduct(doc: ProductSearchDocument) {
    if (!this.client) return;
    try {
      await this.ensureIndex();
      await this.client.index({
        index: this.index,
        id: doc.id,
        document: doc,
        refresh: false,
      });
    } catch (error) {
      this.logger.warn(`Elasticsearch index failed: ${String(error)}`);
    }
  }

  async removeProduct(id: string) {
    if (!this.client) return;
    try {
      await this.client.delete({ index: this.index, id }).catch(() => undefined);
    } catch {
      // ignore
    }
  }

  async searchIds(query: string, limit = 48): Promise<string[] | null> {
    if (!this.client) return null;
    try {
      const result = await this.client.search({
        index: this.index,
        size: limit,
        query: {
          bool: {
            must: [
              {
                multi_match: {
                  query,
                  fields: ["name^3", "shortDescription^2", "description", "brand", "category", "vendor"],
                  fuzziness: "AUTO",
                },
              },
            ],
            filter: [{ term: { status: "ACTIVE" } }],
          },
        },
      });
      return result.hits.hits
        .map((hit) => hit._id)
        .filter((id): id is string => Boolean(id));
    } catch (error) {
      this.logger.warn(`Elasticsearch search failed, using PostgreSQL: ${String(error)}`);
      return null;
    }
  }
}
