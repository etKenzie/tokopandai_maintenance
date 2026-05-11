import { NextRequest, NextResponse } from "next/server";
import { logMaintenanceFetch } from "@/app/api/maintenance/requestLog";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Base already includes `/api` when set like `https://host/api` (see `NEXT_PUBLIC_API_URL`). */
const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");

const getToken = (request: NextRequest) => {
  const authHeader = request.headers.get("authorization");
  return authHeader?.replace("Bearer ", "") || request.cookies.get("token")?.value;
};

export async function GET(request: NextRequest) {
  try {
    if (!apiBaseUrl) {
      return NextResponse.json({ error: "NEXT_PUBLIC_API_URL not configured" }, { status: 500 });
    }

    const token = getToken(request);
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const search = request.nextUrl.searchParams.toString();
    const url = `${apiBaseUrl}/invoices${search ? `?${search}` : ""}`;

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

export async function POST(request: NextRequest) {
  try {
    if (!apiBaseUrl) {
      return NextResponse.json({ error: "NEXT_PUBLIC_API_URL not configured" }, { status: 500 });
    }

    const token = getToken(request);
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const body = await request.text();
    const url = `${apiBaseUrl}/invoices`;

    const res = await logMaintenanceFetch(url, { method: "POST", headers, body });
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
