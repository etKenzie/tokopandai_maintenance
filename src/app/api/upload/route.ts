import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Use JPG, PNG, GIF, or WebP." }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File too large. Maximum size is 5MB." }, { status: 400 });
    }
    const ext = path.extname(file.name) || ".jpg";
    const safeExt = [".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(ext.toLowerCase()) ? ext : ".jpg";
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}${safeExt}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });
    const filePath = path.join(uploadDir, name);
    const bytes = await file.arrayBuffer();
    await writeFile(filePath, new Uint8Array(bytes));
    return NextResponse.json({ url: `/uploads/${name}` });
  } catch (err) {
    return NextResponse.json({ error: "Upload failed", details: err instanceof Error ? err.message : "Unknown error" }, { status: 500 });
  }
}
