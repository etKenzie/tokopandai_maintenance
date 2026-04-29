import { NextRequest, NextResponse } from "next/server";
import { logMaintenanceFetch } from "@/app/api/maintenance/requestLog";

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
    const body = await request.json().catch(() => ({}));
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const url = `${baseUrl}/maintenance/${id}/approve`;
    const res = await logMaintenanceFetch(url, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ tukang_id: body?.tukang_id }),
    });
    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to approve maintenance", details: await res.text() },
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
