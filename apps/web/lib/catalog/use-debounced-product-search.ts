"use client";

import { useEffect, useState } from "react";
import type { ProductListItem } from "@imtiaz-mart/shared";
import { searchProductsClient } from "@/lib/catalog/search-client";

export function useDebouncedProductSearch(query: string, limit = 8, delayMs = 200) {
  const [items, setItems] = useState<ProductListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const hasQuery = query.trim().length > 0;

  useEffect(() => {
    const q = query.trim();
    if (!q) return;

    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setLoading(true);
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

  return {
    items: hasQuery ? items : [],
    total: hasQuery ? total : 0,
    loading: hasQuery && loading,
  };
}
