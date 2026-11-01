/** Resolve local public assets under Vite's configured root or Pages subpath. */
export function assetPath(path: string): string {
  return path.startsWith("/")
    ? import.meta.env.BASE_URL + path.replace(/^\/+/, "")
    : path;
}
