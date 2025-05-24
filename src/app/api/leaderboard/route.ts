import { NextRequest, NextResponse } from "next/server";
import { Score } from "@prisma/client";
import prisma from "@/lib/primsa";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const testType = searchParams.get("testType") || "60";

  try {
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

    const formatted = scores.map((score:Score) => ({
      wpm: score.wpm,
      accuracy: score.accuracy,
      raw: score.raw,
      testType: score.testType,
      user: score.user,
    }));

    return NextResponse.json({ scores: formatted });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json({ error: "Failed to load leaderboard" }, { status: 500 });
  }
}
