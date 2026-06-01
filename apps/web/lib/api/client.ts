import { siteConfig } from "@/config/site";

type RequestOptions = RequestInit & {
  params?: Record<string, string>;
};

export async function apiClient<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { params, ...init } = options;
  const url = new URL(path, siteConfig.apiUrl);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }

  const response = await fetch(url.toString(), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}
