/**
 * Base URL for maintenance API routes when proxying to the Visit backend.
 *
 * Resolution order:
 * 1. `VISIT_API_URL` / `MAINTENANCE_UPSTREAM_URL` — server-only, reliable at runtime on hosts.
 * 2. `NEXT_PUBLIC_AM_API_URL` — same source as `getApiUrl()` / payroll; prefer when set.
 * 3. `NEXT_PUBLIC_VISIT_URL` — fallback when AM URL is unset (same host in many deployments).
 */
export function getMaintenanceUpstreamBaseUrl(): string {
  const raw =
    process.env.VISIT_API_URL?.trim() ||
    process.env.MAINTENANCE_UPSTREAM_URL?.trim() ||
    process.env.NEXT_PUBLIC_AM_API_URL?.trim() ||
    process.env.NEXT_PUBLIC_VISIT_URL?.trim() ||
    "";
  return raw.replace(/\/$/, "");
}
