"use client";

import { useState } from "react";
import type { ProductDetail } from "@imtiaz-mart/shared";
import { formatPrice } from "@/lib/utils/currency";
import { addToCartAction } from "@/lib/cart/actions";

interface AddToCartPanelProps {
  product: ProductDetail;
}

export function AddToCartPanel({ product }: AddToCartPanelProps) {
  const [variantId, setVariantId] = useState(product.variants[0]?.id ?? "");
  const variant =
    product.variants.find((v) => v.id === variantId) ?? product.variants[0];
  const price = variant?.price ?? product.price;
  const compareAt = variant?.compareAtPrice ?? product.compareAtPrice;
  const inStock = (variant?.stock ?? 0) > 0;

  return (
    <div className="space-y-6">
      {product.variants.length > 1 && (
        <div>
          <p className="mb-2 text-sm font-medium text-primary">Variant</p>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setVariantId(v.id)}
                className={`rounded-lg border px-4 py-2 text-sm transition-colors ${
                  variantId === v.id
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border hover:border-accent"
                }`}
              >
                {v.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-bold text-primary">
          {formatPrice(price)}
        </span>
        {compareAt && compareAt > price && (
          <span className="text-lg text-muted line-through">
            {formatPrice(compareAt)}
          </span>
        )}
      </div>

      <p className={`text-sm ${inStock ? "text-success" : "text-error"}`}>
        {inStock ? "In stock — ready to ship" : "Out of stock"}
      </p>

      <form action={addToCartAction} className="flex flex-col gap-3 sm:flex-row">
        <input type="hidden" name="variantId" value={variantId} />
        <input type="hidden" name="quantity" value="1" />
        <input type="hidden" name="redirectTo" value="/cart" />
        <button
          type="submit"
          disabled={!inStock}
          className="flex-1 rounded-lg bg-cta py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Add to cart
        </button>
        <a
          href="/checkout"
          className={`flex-1 rounded-lg border border-border py-3.5 text-center text-sm font-semibold text-primary transition-colors hover:bg-surface ${!inStock ? "pointer-events-none opacity-50" : ""}`}
        >
          Buy now
        </a>
      </form>

      <div className="rounded-lg border border-border bg-surface p-4 text-sm text-muted">
        <p className="font-medium text-primary">Delivery estimate</p>
        <p className="mt-1">Standard: 3–5 business days · Express: 1–2 days</p>
        <p className="mt-2">Free shipping on orders over Rs. 2,999</p>
      </div>
    </div>
  );
}
