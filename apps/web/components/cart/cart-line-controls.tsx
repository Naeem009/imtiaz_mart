"use client";

import { useTransition } from "react";
import { removeCartItemAction, updateCartItemAction } from "@/lib/cart/actions";

interface CartLineControlsProps {
  itemId: string;
  quantity: number;
  maxStock: number;
}

export function CartLineControls({
  itemId,
  quantity,
  maxStock,
}: CartLineControlsProps) {
  const [pending, startTransition] = useTransition();
  const maxQty = Math.min(10, maxStock);

  function updateQty(qty: number) {
    const fd = new FormData();
    fd.set("itemId", itemId);
    fd.set("quantity", String(qty));
    startTransition(() => updateCartItemAction(fd));
  }

  function remove() {
    const fd = new FormData();
    fd.set("itemId", itemId);
    startTransition(() => removeCartItemAction(fd));
  }

  return (
    <div className={`flex items-center gap-4 ${pending ? "opacity-60" : ""}`}>
      <select
        value={quantity}
        onChange={(e) => updateQty(parseInt(e.target.value, 10))}
        className="rounded border border-border bg-background px-2 py-1 text-sm"
        aria-label="Quantity"
      >
        {Array.from({ length: maxQty }, (_, i) => i + 1).map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={remove}
        className="text-sm text-error hover:underline"
      >
        Remove
      </button>
    </div>
  );
}
