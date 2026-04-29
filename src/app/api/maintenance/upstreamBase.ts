/**
 * Base URL for maintenance API routes when proxying to the Visit backend.
 *
 * Resolution order:
 * 1. `VISIT_API_URL` / `MAINTENANCE_UPSTREAM_URL` — server-only, reliable at runtime on hosts.
 * 2. `NEXT_PUBLIC_VISIT_URL` — use this in prod when it is set for **Production** and you redeploy
 *    after changing it (some setups bake `NEXT_PUBLIC_*` at build time).
 * 3. `NEXT_PUBLIC_AM_API_URL` — same API base as visit in many deployments; used if visit URL is unset.
 */
export function getMaintenanceUpstreamBaseUrl(): string {
  const raw =
    process.env.VISIT_API_URL?.trim() ||
    process.env.MAINTENANCE_UPSTREAM_URL?.trim() ||
    process.env.NEXT_PUBLIC_VISIT_URL?.trim() ||
    process.env.NEXT_PUBLIC_AM_API_URL?.trim() ||
    "";
  return raw.replace(/\/$/, "");
}
