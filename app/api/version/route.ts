import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    version: "1.0.0",
    download_mac: "https://github.com/ToniKroosome/caption-th-web/releases/latest/download/TumMuSubBu-Mac.dmg",
    download_win: "https://github.com/ToniKroosome/caption-th-web/releases/latest/download/TumMuSubBu-Windows.exe",
  });
}
