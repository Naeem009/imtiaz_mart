import { toggleCompareAction } from "@/lib/compare/actions";

export function CompareToggle({
  productId,
  selected,
}: {
  productId: string;
  selected: boolean;
}) {
  return (
    <form action={toggleCompareAction}>
      <input type="hidden" name="productId" value={productId} />
      <button
        type="submit"
        aria-pressed={selected}
        className={`text-sm ${selected ? "font-medium text-accent" : "text-muted hover:text-accent"}`}
      >
        {selected ? "In compare" : "Compare"}
      </button>
    </form>
  );
}
