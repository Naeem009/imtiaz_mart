"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { addToCartApi, createOrderApi, removeCartItemApi, updateCartItemApi } from "./api";

export async function addToCartAction(formData: FormData) {
  const variantId = formData.get("variantId") as string;
  const quantity = parseInt(formData.get("quantity") as string, 10) || 1;
  const redirectTo = (formData.get("redirectTo") as string) || "/cart";

  try {
    await addToCartApi(variantId, quantity);
    revalidatePath("/cart");
    revalidatePath("/");
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not add to cart";
    redirect(`${redirectTo}?error=${encodeURIComponent(message)}`);
  }

  redirect(redirectTo);
}

export async function updateCartItemAction(formData: FormData) {
  const itemId = formData.get("itemId") as string;
  const quantity = parseInt(formData.get("quantity") as string, 10);
  if (quantity < 1) {
    await removeCartItemApi(itemId);
  } else {
    await updateCartItemApi(itemId, quantity);
  }
  revalidatePath("/cart");
  revalidatePath("/checkout");
}

export async function removeCartItemAction(formData: FormData) {
  const itemId = formData.get("itemId") as string;
  await removeCartItemApi(itemId);
  revalidatePath("/cart");
  revalidatePath("/checkout");
}

export async function checkoutAction(formData: FormData) {
  try {
    const order = await createOrderApi({
      shippingName: formData.get("shippingName") as string,
      shippingPhone: (formData.get("shippingPhone") as string) || undefined,
      shippingLine1: formData.get("shippingLine1") as string,
      shippingLine2: (formData.get("shippingLine2") as string) || undefined,
      shippingCity: formData.get("shippingCity") as string,
      shippingState: (formData.get("shippingState") as string) || undefined,
      shippingPostal: formData.get("shippingPostal") as string,
      shippingCountry: (formData.get("shippingCountry") as string) || "PK",
      paymentMethod: (formData.get("paymentMethod") as "cod" | "card") || "cod",
    });
    revalidatePath("/cart");
    redirect(`/orders/${order.orderNumber}`);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Checkout failed";
    redirect(`/checkout?error=${encodeURIComponent(message)}`);
  }
}
