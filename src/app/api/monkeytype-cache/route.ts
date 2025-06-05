import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import cacheManager from "@/lib/monkeytypeCache";

export async function GET() {
  try {
    const stats = cacheManager.getCacheStats();
    const cachedData = cacheManager.getCachedData();

    return NextResponse.json({
      stats,
      userCount: cachedData.length,
      users: cachedData.map(user => ({
        discordId: user.discordId,
        mtUsername: user.mtUsername,
        lastFetched: user.lastFetched,
        fetchAttempts: user.fetchAttempts,
        lastError: user.lastError,
        hasScores: Object.values(user.scores).some(score => score !== null),
      })),
    });
  } catch (error) {
    console.error("Error getting cache stats:", error);
    return NextResponse.json({ error: "Failed to get cache stats" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.id !== process.env.NEXT_PUBLIC_ADMIN_ID) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { action } = await req.json();

  try {
    if (action === "force-update") {
      await cacheManager.forceUpdate();
      return NextResponse.json({ message: "Cache update triggered successfully" });
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error managing cache:", error);
    return NextResponse.json({ error: "Failed to manage cache" }, { status: 500 });
  }
}
