import type { CategoryListItem, VendorProductDto } from "@imtiaz-mart/shared";
import { updateVendorProductAction } from "@/lib/vendor/actions";

export function EditProductForm({
  product,
  categories,
}: {
  product: VendorProductDto;
  categories: CategoryListItem[];
}) {
  return (
    <form action={updateVendorProductAction} className="space-y-4">
      <input type="hidden" name="id" value={product.id} />

      <div>
        <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-primary">
          Product name
        </label>
        <input
          id="name"
          name="name"
          required
          minLength={2}
          defaultValue={product.name}
          className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="price" className="mb-1.5 block text-sm font-medium text-primary">
            Price (PKR)
          </label>
          <input
            id="price"
            name="price"
            type="number"
            min={0}
            step="1"
            required
            defaultValue={product.price}
            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm"
          />
        </div>
        <div>
          <label htmlFor="stock" className="mb-1.5 block text-sm font-medium text-primary">
            Stock
          </label>
          <input
            id="stock"
            name="stock"
            type="number"
            min={0}
            required
            defaultValue={product.stock}
            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm"
          />
        </div>
      </div>

      <div>
        <label htmlFor="categoryId" className="mb-1.5 block text-sm font-medium text-primary">
          Category
        </label>
        <select
          id="categoryId"
          name="categoryId"
          required
          defaultValue={product.categoryId}
          className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm"
        >
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="shortDescription" className="mb-1.5 block text-sm font-medium text-primary">
          Short description
        </label>
        <textarea
          id="shortDescription"
          name="shortDescription"
          rows={3}
          defaultValue={product.shortDescription ?? ""}
          className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm"
        />
      </div>

      <div>
        <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-primary">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={5}
          defaultValue={product.description ?? ""}
          className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm"
        />
      </div>

      <div>
        <label htmlFor="imageUrl" className="mb-1.5 block text-sm font-medium text-primary">
          Primary image URL
        </label>
        <input
          id="imageUrl"
          name="imageUrl"
          type="url"
          defaultValue={product.primaryImage ?? ""}
          placeholder="https://"
          className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm"
        />
      </div>

      <div>
        <label htmlFor="compareAtPrice" className="mb-1.5 block text-sm font-medium text-primary">
          Compare-at price (PKR)
        </label>
        <input
          id="compareAtPrice"
          name="compareAtPrice"
          type="number"
          min={0}
          step="1"
          defaultValue={product.compareAtPrice ?? ""}
          className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm"
        />
      </div>

      <div>
        <label htmlFor="status" className="mb-1.5 block text-sm font-medium text-primary">
          Status
        </label>
        <select
          id="status"
          name="status"
          defaultValue={product.status}
          className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm"
        >
          <option value="DRAFT">Draft</option>
          <option value="ACTIVE">Active</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </div>

      <label className="flex items-center gap-2 text-sm text-primary">
        <input type="checkbox" name="isEligibleSearch" defaultChecked={product.isEligibleSearch} />
        Include in AI discovery feeds
      </label>
      <label className="flex items-center gap-2 text-sm text-primary">
        <input
          type="checkbox"
          name="isEligibleCheckout"
          defaultChecked={product.isEligibleCheckout}
        />
        Allow agentic checkout
      </label>

      <button
        type="submit"
        className="w-full rounded-lg bg-cta px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
      >
        Save changes
      </button>
    </form>
  );
}
