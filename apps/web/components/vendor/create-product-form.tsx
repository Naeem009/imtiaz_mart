import type { CategoryListItem } from "@imtiaz-mart/shared";
import { createVendorProductAction } from "@/lib/vendor/actions";

export function CreateProductForm({ categories }: { categories: CategoryListItem[] }) {
  return (
    <form action={createVendorProductAction} className="space-y-4">
      <div>
        <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-primary">
          Product name
        </label>
        <input
          id="name"
          name="name"
          required
          minLength={2}
          className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm"
        />
      </div>
      <div>
        <label htmlFor="categoryId" className="mb-1.5 block text-sm font-medium text-primary">
          Category
        </label>
        <select
          id="categoryId"
          name="categoryId"
          required
          className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm"
        >
          <option value="">Select a category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
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
            defaultValue={50}
            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm"
          />
        </div>
      </div>
      <div>
        <label htmlFor="shortDescription" className="mb-1.5 block text-sm font-medium text-primary">
          Short description
        </label>
        <textarea
          id="shortDescription"
          name="shortDescription"
          rows={3}
          className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm"
        />
      </div>
      <div>
        <label htmlFor="imageUrl" className="mb-1.5 block text-sm font-medium text-primary">
          Image URL
        </label>
        <input
          id="imageUrl"
          name="imageUrl"
          type="url"
          placeholder="https://"
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
          defaultValue="ACTIVE"
          className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm"
        >
          <option value="DRAFT">Draft</option>
          <option value="ACTIVE">Active</option>
        </select>
      </div>
      <label className="flex items-center gap-2 text-sm text-primary">
        <input type="checkbox" name="isEligibleSearch" defaultChecked />
        Include in AI discovery feeds
      </label>
      <label className="flex items-center gap-2 text-sm text-primary">
        <input type="checkbox" name="isEligibleCheckout" />
        Allow agentic checkout
      </label>
      <button
        type="submit"
        className="w-full rounded-lg bg-cta px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
      >
        Create product
      </button>
    </form>
  );
}
