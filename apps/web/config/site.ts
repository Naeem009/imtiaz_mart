export const siteConfig = {
  name: "Imtiaz Mart",
  description:
    "Enterprise multi-vendor marketplace — premium shopping, trusted vendors, fast delivery.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1",
} as const;
