/**
 * Maintenance-only: logs each upstream request/response and error body to the console.
 * Used by Next `/api/maintenance/*` routes and maintenance UI pages.
 */
function absoluteUrlIfPossible(url: string): string | undefined {
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (typeof window !== "undefined") {
    try {
      return new URL(url, window.location.origin).href;
    } catch {
      return undefined;
    }
  }
  return undefined;
}

export async function logMaintenanceFetch(url: string, init?: RequestInit): Promise<Response> {
  const method = init?.method ?? "GET";
  const visit = process.env.NEXT_PUBLIC_VISIT_URL ?? "(not set)";
  const api = process.env.NEXT_PUBLIC_API_URL ?? "(not set)";
  const absoluteInput = absoluteUrlIfPossible(url);
  console.log(
    `[maintenance][env] NEXT_PUBLIC_VISIT_URL=${visit} | NEXT_PUBLIC_API_URL=${api} | thisRequestUrl=${url}${absoluteInput ? ` | absoluteRequestUrl=${absoluteInput}` : ""}`
  );
  console.log("[maintenance][request]", {
    method,
    requestUrl: url,
    ...(absoluteInput ? { absoluteRequestUrl: absoluteInput } : {}),
  });
  let res: Response;
  try {
    res = await fetch(url, init);
  } catch (error) {
    console.error("[maintenance][network-error]", {
      method,
      url,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
  console.log("[maintenance][response]", {
    method,
    requestUrl: url,
    ...(absoluteInput ? { absoluteRequestUrl: absoluteInput } : {}),
    responseUrl: res.url || "",
    status: res.status,
    statusText: res.statusText,
  });
  if (!res.ok) {
    console.error("[maintenance]", method, url, "error body:", await res.clone().text());
  }
  return res;
}
