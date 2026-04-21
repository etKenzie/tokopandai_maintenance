import { NextRequest, NextResponse } from "next/server";

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

    const res = await fetch(`${baseUrl}/maintenance/tukang`, { method: "GET", headers });
    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: "Failed to fetch tukang", details: text }, { status: res.status });
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

    const res = await fetch(`${baseUrl}/maintenance/tukang`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        tukang_name: body.tukang_name,
        skill_list: body.skill_list,
        location: body.location,
        address: body.address,
        ktp: body.ktp,
        phone: body.phone,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: "Failed to create tukang", details: text }, { status: res.status });
    }

    return NextResponse.json(await res.json());
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}
