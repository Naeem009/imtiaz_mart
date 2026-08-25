import { ShopShell } from "@/components/layout/shop-shell";
import { LiveSearch } from "@/components/search/live-search";

export const metadata = {
  title: "Search",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const q = params.q?.trim() ?? "";

  return (
    <ShopShell>
      <LiveSearch initialQuery={q} />
    </ShopShell>
  );
}
