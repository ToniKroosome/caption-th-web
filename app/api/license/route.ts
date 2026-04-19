import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ tier: "free" });

  const user = await currentUser();
  const hasPaid = user?.publicMetadata?.hasPaidAccess === true;
  return NextResponse.json({ tier: hasPaid ? "paid" : "free" });
}
