import type { AuthUser, CustomerAddressDto } from "@imtiaz-mart/shared";
import { checkoutAction } from "@/lib/cart/actions";
import { formatPrice } from "@/lib/utils/currency";

interface CheckoutFormProps {
  user: AuthUser;
  addresses: CustomerAddressDto[];
  subtotal: number;
  shipping: number;
  total: number;
}

export function CheckoutForm({
  user,
  addresses,
  subtotal,
  shipping,
  total,
}: CheckoutFormProps) {
  const defaultAddr = addresses.find((a) => a.isDefault) ?? addresses[0];

  return (
    <form action={checkoutAction} className="mt-8 space-y-6">
      {addresses.length > 0 && (
        <fieldset className="space-y-3">
          <legend className="text-lg font-semibold text-primary">
            Saved addresses
          </legend>
          {addresses.map((addr) => (
            <label
              key={addr.id}
              className="flex cursor-pointer gap-3 rounded-lg border border-border p-4 has-[:checked]:border-accent has-[:checked]:bg-accent/5"
            >
              <input
                type="radio"
                name="addressId"
                value={addr.id}
                defaultChecked={addr.id === defaultAddr?.id}
                className="mt-1"
              />
              <span className="text-sm">
                <span className="font-medium text-primary">{addr.label}</span>
                <span className="mt-1 block text-muted">
                  {addr.line1}, {addr.city} {addr.postalCode}
                </span>
              </span>
            </label>
          ))}
          <label className="flex cursor-pointer items-center gap-2 text-sm text-muted">
            <input type="radio" name="addressId" value="new" />
            Use a different address
          </label>
        </fieldset>
      )}

      <fieldset className="space-y-4" id="shipping-fields">
        <legend className="text-lg font-semibold text-primary">
          {addresses.length ? "Or enter shipping details" : "Shipping address"}
        </legend>
        <div>
          <label className="mb-1.5 block text-sm font-medium" htmlFor="shippingName">
            Full name
          </label>
          <input
            id="shippingName"
            name="shippingName"
            required={!addresses.length}
            defaultValue={[user.firstName, user.lastName]
              .filter(Boolean)
              .join(" ")}
            className="w-full rounded-lg border border-border px-4 py-2.5 text-sm"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium" htmlFor="shippingPhone">
            Phone
          </label>
          <input
            id="shippingPhone"
            name="shippingPhone"
            type="tel"
            defaultValue={defaultAddr?.phone ?? undefined}
            className="w-full rounded-lg border border-border px-4 py-2.5 text-sm"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium" htmlFor="shippingLine1">
            Address line 1
          </label>
          <input
            id="shippingLine1"
            name="shippingLine1"
            required={!addresses.length}
            defaultValue={defaultAddr?.line1}
            className="w-full rounded-lg border border-border px-4 py-2.5 text-sm"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium" htmlFor="shippingLine2">
            Address line 2 (optional)
          </label>
          <input
            id="shippingLine2"
            name="shippingLine2"
            defaultValue={defaultAddr?.line2 ?? undefined}
            className="w-full rounded-lg border border-border px-4 py-2.5 text-sm"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium" htmlFor="shippingCity">
              City
            </label>
            <input
              id="shippingCity"
              name="shippingCity"
              required={!addresses.length}
              defaultValue={defaultAddr?.city}
              className="w-full rounded-lg border border-border px-4 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium" htmlFor="shippingPostal">
              Postal code
            </label>
            <input
              id="shippingPostal"
              name="shippingPostal"
              required={!addresses.length}
              defaultValue={defaultAddr?.postalCode}
              className="w-full rounded-lg border border-border px-4 py-2.5 text-sm"
            />
          </div>
        </div>
        <input type="hidden" name="shippingCountry" value="PK" />
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-lg font-semibold text-primary">Payment</legend>
        <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-4 has-[:checked]:border-accent has-[:checked]:bg-accent/5">
          <input
            type="radio"
            name="paymentMethod"
            value="cod"
            defaultChecked
            className="text-accent"
          />
          <span>
            <span className="font-medium text-primary">Cash on delivery</span>
            <span className="mt-0.5 block text-sm text-muted">
              Pay when your order arrives
            </span>
          </span>
        </label>
      </fieldset>

      <button
        type="submit"
        className="w-full rounded-lg bg-cta py-4 text-sm font-semibold text-white hover:opacity-90"
      >
        Place order — {formatPrice(total)}
      </button>
    </form>
  );
}
