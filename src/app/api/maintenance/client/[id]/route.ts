import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const getToken = (request: NextRequest) => {
  const authHeader = request.headers.get("authorization");
  return authHeader?.replace("Bearer ", "") || request.cookies.get("token")?.value;
};

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_VISIT_URL || "";
    if (!baseUrl) {
      return NextResponse.json({ error: "API URL not configured" }, { status: 500 });
    }
    const { id } = await params;
    const token = getToken(request);
    const body = await request.json();
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${baseUrl}/maintenance/client/${id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify({ client_name: body.client_name }),
    });
    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: "Failed to update client", details: text }, { status: res.status });
    }
    return NextResponse.json(await res.json());
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_VISIT_URL || "";
    if (!baseUrl) {
      return NextResponse.json({ error: "API URL not configured" }, { status: 500 });
    }
    const { id } = await params;
    const token = getToken(request);
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${baseUrl}/maintenance/client/${id}`, {
      method: "DELETE",
      headers,
    });
    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: "Failed to delete client", details: text }, { status: res.status });
    }
    return NextResponse.json(await res.json().catch(() => ({})));
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}
