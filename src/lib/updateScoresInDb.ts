import prisma from "./primsa";

interface UserScore {
  wpm15: number | null;
  raw15: number | null;
  acc15: number | null;
  wpm30: number | null;
  raw30: number | null;
  acc30: number | null;
  wpm60: number | null;
  raw60: number | null;
  acc60: number | null;
}

export async function updateScoresInDb(discordId: string, scores: UserScore) {
  const scoreMap = [
    { type: "60", wpm: scores.wpm60, raw: scores.raw60, accuracy: scores.acc60 },
    { type: "30", wpm: scores.wpm30, raw: scores.raw30, accuracy: scores.acc30 },
    { type: "15", wpm: scores.wpm15, raw: scores.raw15, accuracy: scores.acc15 },
  ];

  for (const s of scoreMap) {
    if (s.wpm !== null && !isNaN(s.wpm)) {
      try {
        await prisma.score.upsert({
          where: {
            userId_testType: {
              userId: discordId,
              testType: s.type,
            },
          },
          update: {
            wpm: s.wpm,
            raw: s.raw,
            accuracy: s.accuracy,
            createdAt: new Date(),
          },
          create: {
            userId: discordId,
            testType: s.type,
            wpm: s.wpm,
            raw: s.raw,
            accuracy: s.accuracy,
          },
        });
      } catch (error) {
        console.warn(`Failed to upsert score for ${discordId}, testType ${s.type}:`, error);
      }
    }
  }
}
