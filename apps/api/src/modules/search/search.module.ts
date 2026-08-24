import { Global, Module } from "@nestjs/common";
import { CatalogSearchService } from "./catalog-search.service";
import { ElasticsearchService } from "./elasticsearch.service";

@Global()
@Module({
  providers: [ElasticsearchService, CatalogSearchService],
  exports: [CatalogSearchService, ElasticsearchService],
})
export class SearchModule {}
