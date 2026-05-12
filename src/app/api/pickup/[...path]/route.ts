import { NextRequest, NextResponse } from "next/server";
import { logMaintenanceFetch } from "@/app/api/maintenance/requestLog";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Same base convention as `src/app/api/invoices/route.ts` (`https://host/api`, no trailing slash). */
const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");

const getToken = (request: NextRequest) => {
  const authHeader = request.headers.get("authorization");
  return authHeader?.replace("Bearer ", "") || request.cookies.get("token")?.value;
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const incoming = `${request.nextUrl.pathname}${request.nextUrl.search}`;
    // Server-side only: appears in the terminal running `next dev` / `next start`, not in the browser console.
    console.log("[pickup proxy] incoming", incoming, { path });

    if (!apiBaseUrl) {
      console.warn("[pickup proxy] NEXT_PUBLIC_API_URL is empty; skipping upstream");
      return NextResponse.json({ error: "NEXT_PUBLIC_API_URL not configured" }, { status: 500 });
    }

    if (!path?.length) {
      return NextResponse.json({ error: "Path required" }, { status: 400 });
    }

    const token = getToken(request);
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const segment = path.join("/");
    const search = request.nextUrl.searchParams.toString();
    const url = `${apiBaseUrl}/pickup/${segment}${search ? `?${search}` : ""}`;

    // TODO: remove temporary pickup upstream URL logging
    console.log("[pickup proxy] upstream GET", url);

    const res = await logMaintenanceFetch(url, { method: "GET", headers });
    const text = await res.text();

    try {
      const json = JSON.parse(text);
      return NextResponse.json(json, { status: res.status });
    } catch {
      return NextResponse.json({ raw: text }, { status: res.status });
    }
  } catch (error) {
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown",
      },
      { status: 500 }
    );
  }
}
