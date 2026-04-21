import { NextResponse } from "next/server";

const ADMIN_SECRET = process.env.ADMIN_SECRET || "";
const VERCEL_TOKEN = process.env.VERCEL_TOKEN || "";
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID || "";
const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID || "";
const GITHUB_REPO = "ToniKroosome/caption-th-web";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get("secret") !== ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [downloads, pageViews] = await Promise.all([
    fetchDownloads(),
    fetchPageViews(),
  ]);

  return NextResponse.json({ downloads, pageViews });
}

async function fetchDownloads() {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/releases`,
      { headers: { "User-Agent": "tum-mu-sub-bu" }, next: { revalidate: 300 } }
    );
    const releases = await res.json();
    const result: { version: string; mac: number; win: number; total: number }[] = [];
    for (const r of releases.slice(0, 10)) {
      let mac = 0, win = 0;
      for (const a of r.assets || []) {
        if (a.name.includes("Mac")) mac += a.download_count;
        else if (a.name.includes("Win") || a.name.includes(".exe")) win += a.download_count;
      }
      result.push({ version: r.tag_name, mac, win, total: mac + win });
    }
    return result;
  } catch {
    return [];
  }
}

async function fetchPageViews() {
  if (!VERCEL_TOKEN || !VERCEL_PROJECT_ID) return null;
  try {
    const teamParam = VERCEL_TEAM_ID ? `&teamId=${VERCEL_TEAM_ID}` : "";
    const end = Date.now();
    const start = end - 7 * 24 * 60 * 60 * 1000;
    const res = await fetch(
      `https://vercel.com/api/web-analytics/timeseries?projectId=${VERCEL_PROJECT_ID}&from=${start}&to=${end}&granularity=1d${teamParam}`,
      { headers: { Authorization: `Bearer ${VERCEL_TOKEN}` }, next: { revalidate: 300 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data;
  } catch {
    return null;
  }
}
