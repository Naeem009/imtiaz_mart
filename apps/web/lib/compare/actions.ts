"use server";

import { revalidatePath } from "next/cache";
import { getCompareIds, MAX_COMPARE, setCompareIds } from "./cookie";

function revalidateCompare() {
  revalidatePath("/", "layout");
  revalidatePath("/compare");
  revalidatePath("/shop");
}

export async function toggleCompareAction(formData: FormData) {
  const productId = String(formData.get("productId") ?? "").trim();
  if (!productId) return;

  const ids = await getCompareIds();
  if (ids.includes(productId)) {
    await setCompareIds(ids.filter((id) => id !== productId));
  } else {
    const next = ids.length >= MAX_COMPARE ? [...ids.slice(1), productId] : [...ids, productId];
    await setCompareIds(next);
  }
  revalidateCompare();
}

export async function removeCompareAction(formData: FormData) {
  const productId = String(formData.get("productId") ?? "").trim();
  if (!productId) return;
  const ids = await getCompareIds();
  await setCompareIds(ids.filter((id) => id !== productId));
  revalidateCompare();
}

export async function clearCompareAction() {
  await setCompareIds([]);
  revalidateCompare();
}
