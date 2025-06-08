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
    const stats = await cacheManager.getCacheStats();
    
    return NextResponse.json({ 
      message: "Cache updated successfully",
      stats: {
        userCount: stats.userCount,
        freshDataCount: stats.freshDataCount,
        lastUpdate: stats.lastGlobalUpdate,
      }
    });
  } catch (err) {
    console.error("Cache refresh failed", err);
    return NextResponse.json({ error: "Failed to refresh cache" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const stats = await cacheManager.getCacheStats();
    return NextResponse.json({
      message: "Cache stats fetched successfully",
      userCount: stats.userCount,
      freshDataCount: stats.freshDataCount,
      lastGlobalUpdate: stats.lastGlobalUpdate,
    });
  } catch (error) {
    console.error("Failed to fetch cache stats", error);
    return NextResponse.json({ error: "Failed to fetch cache stats" }, { status: 500 });
  }
}
