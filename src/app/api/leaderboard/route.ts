import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/primsa";
import cacheManager from "@/lib/monkeytypeCache";

type ScoreWithUser = {
  wpm: number;
  accuracy: number | null;
  raw: number | null;
  testType: string;
  user: {
    discordId: string;
    displayname: string | null;
    username: string;
    avatarUrl: string | null;
    mtVerified: boolean;
    collegeVerified: boolean;
  };
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const testType = searchParams.get("testType") || "60";

  try {
    const cacheStats = await cacheManager.getCacheStats();

    const scores = await prisma.score.findMany({
      where: {
        testType,
      },
      orderBy: {
        wpm: "desc",
      },
      include: {
        user: {
          select: {
            discordId: true,
            displayname: true,
            username: true,
            avatarUrl: true,
            mtVerified: true,
            collegeVerified: true,
          },
        },
      },
      take: 50, 
    });

    const formatted = scores.map((score:ScoreWithUser) => ({
      wpm: score.wpm,
      accuracy: score.accuracy,
      raw: score.raw,
      testType: score.testType,
      user: score.user,
    }));

    return NextResponse.json({ 
      scores: formatted,
      meta: {
        testType,
        totalScores: formatted.length,
        cacheStats: {
          lastUpdate: cacheStats.lastGlobalUpdate,
          userCount: cacheStats.userCount,
          freshDataCount: cacheStats.freshDataCount,
          nextUpdateIn: cacheStats.nextUpdateIn,
          isUpdating: cacheStats.isUpdating,
        }
      }
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json({ error: "Failed to load leaderboard" }, { status: 500 });
  }
}
