import { getApiUrl } from "@/utils/config";

/**
 * Maintenance proxy upstream — same base as the rest of the app (`NEXT_PUBLIC_API_URL` via `getApiUrl()`).
 */
export function getMaintenanceUpstreamBaseUrl(): string {
  return getApiUrl();
}
