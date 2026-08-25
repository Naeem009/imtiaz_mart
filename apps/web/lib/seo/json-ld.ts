import type {
  BlogPostDto,
  CmsPageDto,
  FaqDto,
  ProductDetail,
  ProductListItem,
  PublicVendorDto,
  ReviewDto,
} from "@imtiaz-mart/shared";
import { siteConfig } from "@/config/site";
import { absoluteUrl, httpUrls, siteLogoUrl, siteOrigin } from "@/lib/seo/urls";

export type JsonLdNode = Record<string, unknown>;

function compact(node: JsonLdNode): JsonLdNode {
  const out: JsonLdNode = {};
  for (const [key, value] of Object.entries(node)) {
    if (value === undefined || value === null || value === "") continue;
    if (Array.isArray(value) && value.length === 0) continue;
    out[key] = value;
  }
  return out;
}

export function organizationNode(): JsonLdNode {
  const origin = siteOrigin();
  return compact({
    "@type": "Organization",
    "@id": `${origin}/#organization`,
    name: siteConfig.name,
    url: origin,
    logo: siteLogoUrl(),
    description: siteConfig.description,
  });
}

export function websiteJsonLd(): JsonLdNode {
  const origin = siteOrigin();
  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationNode(),
      compact({
        "@type": "WebSite",
        "@id": `${origin}/#website`,
        url: origin,
        name: siteConfig.name,
        description: siteConfig.description,
        publisher: { "@id": `${origin}/#organization` },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${origin}/search?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      }),
    ],
  };
}

export function breadcrumbJsonLd(
  items: Array<{ name: string; path?: string }>,
): JsonLdNode {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) =>
      compact({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        item: item.path ? absoluteUrl(item.path) : undefined,
      }),
    ),
  };
}

function productAvailability(product: ProductDetail | ProductListItem): string {
  if ("variants" in product && product.variants.length > 0) {
    const stock = product.variants.reduce((sum, variant) => sum + variant.stock, 0);
    return stock > 0
      ? "https://schema.org/InStock"
      : "https://schema.org/OutOfStock";
  }
  return "https://schema.org/InStock";
}

function productImages(product: ProductDetail | ProductListItem): string[] {
  if ("images" in product) {
    return httpUrls(product.images.map((image) => image.url));
  }
  return httpUrls([product.primaryImage]);
}

function offerNode(product: ProductDetail | ProductListItem): JsonLdNode {
  const url = absoluteUrl(`/products/${product.slug}`);
  return compact({
    "@type": "Offer",
    url,
    priceCurrency: siteConfig.currency,
    price: String(product.price),
    availability: productAvailability(product),
    itemCondition: "https://schema.org/NewCondition",
    seller: compact({
      "@type": "Organization",
      name: product.vendor.name,
      url: absoluteUrl(`/vendors/${product.vendor.slug}`),
    }),
  });
}

export function productJsonLd(
  product: ProductDetail,
  reviews: ReviewDto[] = [],
): JsonLdNode {
  const url = absoluteUrl(`/products/${product.slug}`);
  const images = productImages(product);

  return compact({
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription ?? product.description ?? undefined,
    sku: product.sku ?? undefined,
    url,
    image: images,
    brand: product.brand
      ? compact({ "@type": "Brand", name: product.brand.name })
      : undefined,
    category: product.category.name,
    offers: offerNode(product),
    aggregateRating:
      product.reviewCount > 0
        ? compact({
            "@type": "AggregateRating",
            ratingValue: String(product.rating),
            reviewCount: String(product.reviewCount),
            bestRating: "5",
            worstRating: "1",
          })
        : undefined,
    review: reviews.slice(0, 8).map((review) =>
      compact({
        "@type": "Review",
        author: { "@type": "Person", name: review.authorName },
        datePublished: review.createdAt,
        name: review.title ?? undefined,
        reviewBody: review.body,
        reviewRating: {
          "@type": "Rating",
          ratingValue: String(review.rating),
          bestRating: "5",
          worstRating: "1",
        },
      }),
    ),
  });
}

export function itemListJsonLd(
  name: string,
  path: string,
  products: ProductListItem[],
): JsonLdNode {
  return compact({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    url: absoluteUrl(path),
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: products.length,
      itemListElement: products.map((product, index) =>
        compact({
          "@type": "ListItem",
          position: index + 1,
          url: absoluteUrl(`/products/${product.slug}`),
          name: product.name,
        }),
      ),
    },
  });
}

export function vendorJsonLd(
  vendor: PublicVendorDto,
  products: ProductListItem[],
): JsonLdNode {
  return compact({
    "@context": "https://schema.org",
    "@type": "Organization",
    name: vendor.name,
    url: absoluteUrl(`/vendors/${vendor.slug}`),
    description: vendor.description ?? undefined,
    logo: httpUrls([vendor.logoUrl])[0],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: `${vendor.name} products`,
      itemListElement: products.slice(0, 20).map((product) =>
        compact({
          "@type": "Offer",
          itemOffered: {
            "@type": "Product",
            name: product.name,
            url: absoluteUrl(`/products/${product.slug}`),
          },
          price: String(product.price),
          priceCurrency: siteConfig.currency,
        }),
      ),
    },
  });
}

export function articleJsonLd(post: BlogPostDto): JsonLdNode {
  const url = absoluteUrl(`/blog/${post.slug}`);
  return compact({
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt ?? undefined,
    url,
    mainEntityOfPage: url,
    image: httpUrls([post.coverUrl]),
    datePublished: post.publishedAt ?? undefined,
    author: { "@id": `${siteOrigin()}/#organization` },
    publisher: { "@id": `${siteOrigin()}/#organization` },
  });
}

export function webPageJsonLd(page: CmsPageDto): JsonLdNode {
  const url = absoluteUrl(`/pages/${page.slug}`);
  return compact({
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: page.title,
    description: page.excerpt ?? undefined,
    url,
    dateModified: page.updatedAt,
    publisher: { "@id": `${siteOrigin()}/#organization` },
  });
}

export function faqJsonLd(faqs: FaqDto[]): JsonLdNode | null {
  if (faqs.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}
