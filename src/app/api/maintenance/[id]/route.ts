import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const getToken = (request: NextRequest) => {
  const authHeader = request.headers.get("authorization");
  return authHeader?.replace("Bearer ", "") || request.cookies.get("token")?.value;
};

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_VISIT_URL || "";
    if (!baseUrl) return NextResponse.json({ error: "API URL not configured" }, { status: 500 });
    const { id } = await params;
    const headers: HeadersInit = { "Content-Type": "application/json" };
    const token = getToken(request);
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch(`${baseUrl}/maintenance/${id}`, { method: "GET", headers });
    if (!res.ok) return NextResponse.json({ error: "Failed to fetch maintenance", details: await res.text() }, { status: res.status });
    return NextResponse.json(await res.json());
  } catch (error) {
    return NextResponse.json({ error: "Internal server error", details: error instanceof Error ? error.message : "Unknown" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_VISIT_URL || "";
    if (!baseUrl) return NextResponse.json({ error: "API URL not configured" }, { status: 500 });
    const { id } = await params;
    const headers: HeadersInit = { "Content-Type": "application/json" };
    const token = getToken(request);
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const body = await request.json();
    const res = await fetch(`${baseUrl}/maintenance/${id}`, { method: "PUT", headers, body: JSON.stringify(body) });
    if (!res.ok) return NextResponse.json({ error: "Failed to update maintenance", details: await res.text() }, { status: res.status });
    return NextResponse.json(await res.json());
  } catch (error) {
    return NextResponse.json({ error: "Internal server error", details: error instanceof Error ? error.message : "Unknown" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_VISIT_URL || "";
    if (!baseUrl) return NextResponse.json({ error: "API URL not configured" }, { status: 500 });
    const { id } = await params;
    const headers: HeadersInit = { "Content-Type": "application/json" };
    const token = getToken(request);
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch(`${baseUrl}/maintenance/${id}`, { method: "DELETE", headers });
    if (!res.ok) return NextResponse.json({ error: "Failed to delete maintenance", details: await res.text() }, { status: res.status });
    return NextResponse.json(await res.json().catch(() => ({})));
  } catch (error) {
    return NextResponse.json({ error: "Internal server error", details: error instanceof Error ? error.message : "Unknown" }, { status: 500 });
  }
}
