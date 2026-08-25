import type { JsonLdNode } from "@/lib/seo/json-ld";

export function JsonLd({ data }: { data: JsonLdNode | JsonLdNode[] | null }) {
  if (!data || (Array.isArray(data) && data.length === 0)) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
