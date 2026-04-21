import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const getToken = (request: NextRequest) => {
  const authHeader = request.headers.get("authorization");
  return authHeader?.replace("Bearer ", "") || request.cookies.get("token")?.value;
};

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_VISIT_URL || "";
    if (!baseUrl) return NextResponse.json({ error: "API URL not configured" }, { status: 500 });

    const { id } = await params;
    const token = getToken(request);
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const url = `${baseUrl}/maintenance/${id}/complete`;
    const res = await fetch(url, { method: "PATCH", headers });
    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to complete maintenance", details: await res.text() },
        { status: res.status }
      );
    }

    return NextResponse.json(await res.json().catch(() => ({})));
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}
