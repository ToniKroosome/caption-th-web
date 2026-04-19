import { NextRequest, NextResponse } from "next/server";

// Keys are stored as VALID_KEYS env var: comma-separated UUIDs
// e.g. VALID_KEYS=abc-123,def-456
function getValidKeys(): Set<string> {
  const raw = process.env.VALID_KEYS ?? "";
  return new Set(raw.split(",").map(k => k.trim()).filter(Boolean));
}

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key") ?? "";
  if (!key) return NextResponse.json({ valid: false, reason: "no key" });

  const valid = getValidKeys().has(key);
  return NextResponse.json({ valid });
}
