import Link from "next/link";
import { AccountNav } from "@/components/account/account-nav";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { siteConfig } from "@/config/site";

export function AccountShell({
  children,
  active,
  title,
}: {
  children: React.ReactNode;
  active: string;
  title: string;
}) {
  return (
    <div className="flex min-h-full flex-col pb-16 md:pb-0">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
          <Link href="/" className="text-sm text-muted hover:text-text">
            ← {siteConfig.name}
          </Link>
          <h1 className="mt-4 text-3xl font-bold text-primary">{title}</h1>
          <div className="mt-6">
            <AccountNav active={active} />
          </div>
          <div className="mt-8">{children}</div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
