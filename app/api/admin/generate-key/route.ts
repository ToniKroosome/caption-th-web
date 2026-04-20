import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";

// POST /api/admin/generate-key
// Body: { "secret": "...", "type": "permanent" | "monthly" }
// Returns: { "key": "uuid", "expires": null | "YYYY-MM-DD" }
// Protected by ADMIN_SECRET env var

function getKeys(): Record<string, { expires: string | null }> {
  try {
    return JSON.parse(process.env.KEYS_JSON ?? "{}");
  } catch {
    return {};
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const secret = body.secret ?? "";
  const type = body.type ?? "permanent";

  if (!process.env.ADMIN_SECRET || secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const key = randomUUID();
  let expires: string | null = null;
  if (type === "monthly") {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    expires = d.toISOString().split("T")[0];
  }

  const keys = getKeys();
  keys[key] = { expires };

  // Return the updated KEYS_JSON for you to paste into Vercel env vars
  const updatedJson = JSON.stringify(keys);

  return NextResponse.json({ key, expires, keys_json: updatedJson });
}
