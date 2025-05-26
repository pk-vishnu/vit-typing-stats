import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/primsa";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const scores = await prisma.score.findMany({
    where: { testType: "60" },
    orderBy: { wpm: "desc" },
    select: { userId: true },
  });

  const rank = scores.findIndex(score => score.userId === userId);
  if (rank === -1) {
    return NextResponse.json({ rank: null, message: "User has no 60s score yet." });
  }
  return NextResponse.json({ rank: rank + 1 });
}
