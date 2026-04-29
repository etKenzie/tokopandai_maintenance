/**
 * Maintenance-only: logs each upstream request/response and error body to the console.
 * Used by Next `/api/maintenance/*` routes and maintenance UI pages.
 */
export async function logMaintenanceFetch(url: string, init?: RequestInit): Promise<Response> {
  const method = init?.method ?? "GET";
  console.log("[maintenance]", method, url);
  const res = await fetch(url, init);
  console.log("[maintenance]", method, url, "→", res.status);
  if (!res.ok) {
    console.error("[maintenance]", method, url, "error body:", await res.clone().text());
  }
  return res;
}
