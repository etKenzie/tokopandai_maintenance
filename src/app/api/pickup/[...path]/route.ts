import { NextRequest, NextResponse } from "next/server";
import { logMaintenanceFetch } from "@/app/api/maintenance/requestLog";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
const pickupBaseUrl = (process.env.NEXT_PUBLIC_API_2_URL ?? "").replace(/\/$/, "");

const getToken = (request: NextRequest) => {
  const authHeader = request.headers.get("authorization");
  return authHeader?.replace("Bearer ", "") || request.cookies.get("token")?.value;
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    if (!pickupBaseUrl) {
      return NextResponse.json({ error: "API 2 URL not configured" }, { status: 500 });
    }

    const { path } = await params;
    if (!path?.length) {
      return NextResponse.json({ error: "Path required" }, { status: 400 });
    }

    const token = getToken(request);
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const segment = path.join("/");
    const search = request.nextUrl.searchParams.toString();
    const url = `${pickupBaseUrl}/api/pickup/${segment}${search ? `?${search}` : ""}`;

    // TODO: remove temporary pickup upstream URL logging
    console.log("[pickup proxy] GET", url);

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
