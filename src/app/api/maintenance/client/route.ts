import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const getToken = (request: NextRequest) => {
  const authHeader = request.headers.get("authorization");
  return authHeader?.replace("Bearer ", "") || request.cookies.get("token")?.value;
};

const logProxyResponse = async (label: string, method: string, url: string, res: Response) => {
  const bodyText = await res.clone().text();
  console.log(`[maintenance client proxy] ${label} ${method} ${url} -> ${res.status}`, bodyText);
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
    const res = await fetch(url, { method: "GET", headers });
    await logProxyResponse("GET", "GET", url, res);
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
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({ client_name: body.client_name }),
    });
    await logProxyResponse("POST", "POST", url, res);

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
