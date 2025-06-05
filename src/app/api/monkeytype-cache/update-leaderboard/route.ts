import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import cacheManager from "@/lib/monkeytypeCache";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.id !== process.env.NEXT_PUBLIC_ADMIN_ID) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await cacheManager.forceUpdate();
    return NextResponse.json({ message: "Leaderboard cache update triggered successfully" });
  } catch (error) {
    console.error("Error updating leaderboard cache:", error);
    return NextResponse.json({ error: "Failed to update leaderboard cache" }, { status: 500 });
  }
}
