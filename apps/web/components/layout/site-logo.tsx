import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/config/site";

type SiteLogoProps = {
  /** Header / nav size */
  variant?: "header" | "footer" | "auth";
  href?: string;
  className?: string;
  priority?: boolean;
};

const sizes = {
  header: { width: 120, height: 40, className: "h-8 w-auto sm:h-9" },
  footer: { width: 140, height: 44, className: "h-10 w-auto" },
  auth: { width: 160, height: 48, className: "h-12 w-auto" },
} as const;

export function SiteLogo({
  variant = "header",
  href = "/",
  className = "",
  priority = false,
}: SiteLogoProps) {
  const { width, height, className: sizeClass } = sizes[variant];

  const image = (
    <Image
      src={siteConfig.logo.src}
      alt={siteConfig.logo.alt}
      width={width}
      height={height}
      priority={priority}
      className={`object-contain object-left ${sizeClass} ${className}`}
    />
  );

  if (!href) {
    return image;
  }

  return (
    <Link
      href={href}
      className="inline-flex shrink-0 items-center bg-transparent"
      aria-label={siteConfig.name}
    >
      {image}
    </Link>
  );
}
