"use client";

import { useEffect, useState } from "react";
import type { ProductListItem } from "@imtiaz-mart/shared";
import { searchProductsClient } from "@/lib/catalog/search-client";

export function useDebouncedProductSearch(query: string, limit = 8, delayMs = 200) {
  const [items, setItems] = useState<ProductListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setItems([]);
      setTotal(0);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    const timer = window.setTimeout(() => {
      void searchProductsClient(q, limit, controller.signal)
        .then((result) => {
          setItems(result.items);
          setTotal(result.total);
        })
        .catch((error: unknown) => {
          if (error instanceof DOMException && error.name === "AbortError") return;
          setItems([]);
          setTotal(0);
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, delayMs);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query, limit, delayMs]);

  return { items, total, loading };
}
