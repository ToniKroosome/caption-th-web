import { NextRequest, NextResponse } from "next/server";

// Keys stored in KEYS_JSON env var as JSON:
// { "uuid-xxx": { "expires": null } }          — permanent
// { "uuid-xxx": { "expires": "2026-05-20" } }  — monthly

function getKeys(): Record<string, { expires: string | null }> {
  try {
    return JSON.parse(process.env.KEYS_JSON ?? "{}");
  } catch {
    return {};
  }
}

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key") ?? "";
  if (!key) return NextResponse.json({ valid: false, reason: "no key" });

  const keys = getKeys();
  const entry = keys[key];
  if (!entry) return NextResponse.json({ valid: false, reason: "invalid key" });

  if (entry.expires) {
    const expired = new Date() > new Date(entry.expires);
    if (expired) return NextResponse.json({ valid: false, reason: "expired" });
  }

  return NextResponse.json({ valid: true, expires: entry.expires });
}
