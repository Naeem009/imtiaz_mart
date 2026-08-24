const SURFACES = [
  "bg-blue-100",
  "bg-emerald-100",
  "bg-amber-100",
  "bg-rose-100",
  "bg-violet-100",
  "bg-cyan-100",
  "bg-orange-100",
  "bg-slate-200",
];

const COVERS = [
  "bg-gradient-to-br from-slate-700 to-blue-800",
  "bg-gradient-to-br from-emerald-700 to-teal-800",
  "bg-gradient-to-br from-orange-600 to-rose-700",
];

export function surfaceFromSlug(slug: string, palettes = SURFACES): string {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) hash += slug.charCodeAt(i);
  return palettes[hash % palettes.length] ?? palettes[0];
}

export function coverFromSlug(slug: string): string {
  return surfaceFromSlug(slug, COVERS);
}

export function isHttpUrl(value: string | null | undefined): boolean {
  if (!value) return false;
  return /^https?:\/\//i.test(value) || value.startsWith("/");
}
