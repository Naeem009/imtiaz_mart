import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export function ShopShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-col pb-16 md:pb-0">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
