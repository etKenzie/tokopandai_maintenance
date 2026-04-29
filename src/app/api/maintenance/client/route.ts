import { NextRequest, NextResponse } from "next/server";
import { logMaintenanceFetch } from "@/app/api/maintenance/requestLog";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const getToken = (request: NextRequest) => {
  const authHeader = request.headers.get("authorization");
  return authHeader?.replace("Bearer ", "") || request.cookies.get("token")?.value;
};

export async function GET(request: NextRequest) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_VISIT_URL || "";
    if (!baseUrl) {
      return NextResponse.json({ error: "API URL not configured" }, { status: 500 });
    }

    const token = getToken(request);
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const url = `${baseUrl}/maintenance/client`;
    const res = await logMaintenanceFetch(url, { method: "GET", headers });
    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: "Failed to fetch clients", details: text }, { status: res.status });
    }

    return NextResponse.json(await res.json());
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_VISIT_URL || "";
    if (!baseUrl) {
      return NextResponse.json({ error: "API URL not configured" }, { status: 500 });
    }

    const token = getToken(request);
    const body = await request.json();
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const url = `${baseUrl}/maintenance/client`;
    const res = await logMaintenanceFetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({ client_name: body.client_name }),
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: "Failed to create client", details: text }, { status: res.status });
    }

    return NextResponse.json(await res.json());
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}
