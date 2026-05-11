import { NextRequest, NextResponse } from "next/server";
import { logMaintenanceFetch } from "@/app/api/maintenance/requestLog";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");

const getToken = (request: NextRequest) => {
  const authHeader = request.headers.get("authorization");
  return authHeader?.replace("Bearer ", "") || request.cookies.get("token")?.value;
};

type RouteCtx = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: RouteCtx) {
  try {
    if (!apiBaseUrl) {
      return NextResponse.json({ error: "NEXT_PUBLIC_API_URL not configured" }, { status: 500 });
    }
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const token = getToken(request);
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const body = await request.text();
    const url = `${apiBaseUrl}/invoices/${encodeURIComponent(id)}`;
    const res = await logMaintenanceFetch(url, { method: "PATCH", headers, body });
    const text = await res.text();

    try {
      return NextResponse.json(JSON.parse(text), { status: res.status });
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

export async function DELETE(request: NextRequest, { params }: RouteCtx) {
  try {
    if (!apiBaseUrl) {
      return NextResponse.json({ error: "NEXT_PUBLIC_API_URL not configured" }, { status: 500 });
    }
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const token = getToken(request);
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const url = `${apiBaseUrl}/invoices/${encodeURIComponent(id)}`;
    const res = await logMaintenanceFetch(url, { method: "DELETE", headers });
    const text = await res.text();

    try {
      return NextResponse.json(JSON.parse(text), { status: res.status });
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
