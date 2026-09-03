"use client";

import { useState } from "react";
import type { VendorProductVariantDto } from "@imtiaz-mart/shared";

type DraftVariant = Omit<VendorProductVariantDto, "id"> & { id?: string };

export function VariantEditor({ variants }: { variants: VendorProductVariantDto[] }) {
  const [items, setItems] = useState<DraftVariant[]>(
    variants.length
      ? variants
      : [{ name: "Default", sku: null, price: 0, compareAtPrice: null, stock: 0 }],
  );

  function update(index: number, field: keyof DraftVariant, value: string) {
    setItems((current) =>
      current.map((item, itemIndex) => {
        if (itemIndex !== index) return item;
        if (field === "name" || field === "sku") return { ...item, [field]: value || null };
        return { ...item, [field]: value === "" ? 0 : Number(value) };
      }),
    );
  }

  function addVariant() {
    setItems((current) => [
      ...current,
      { name: "", sku: null, price: 0, compareAtPrice: null, stock: 0 },
    ]);
  }

  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-medium text-primary">Variants</legend>
      <input type="hidden" name="variants" value={JSON.stringify(items)} />
      {items.map((variant, index) => (
        <div key={variant.id ?? `new-${index}`} className="rounded-lg border border-border p-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              aria-label={`Variant ${index + 1} name`}
              value={variant.name}
              onChange={(event) => update(index, "name", event.target.value)}
              placeholder="Variant name"
              required
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
            <input
              aria-label={`Variant ${index + 1} SKU`}
              value={variant.sku ?? ""}
              onChange={(event) => update(index, "sku", event.target.value)}
              placeholder="SKU (optional)"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
            <input
              aria-label={`Variant ${index + 1} price`}
              type="number"
              min={0}
              value={variant.price}
              onChange={(event) => update(index, "price", event.target.value)}
              placeholder="Price"
              required
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
            <input
              aria-label={`Variant ${index + 1} compare-at price`}
              type="number"
              min={0}
              value={variant.compareAtPrice ?? ""}
              onChange={(event) => update(index, "compareAtPrice", event.target.value)}
              placeholder="Compare-at price"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
            <input
              aria-label={`Variant ${index + 1} stock`}
              type="number"
              min={0}
              value={variant.stock}
              onChange={(event) => update(index, "stock", event.target.value)}
              placeholder="Stock"
              required
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={addVariant}
        className="rounded-lg border border-border px-3 py-2 text-sm font-medium text-primary hover:bg-background"
      >
        Add variant
      </button>
    </fieldset>
  );
}