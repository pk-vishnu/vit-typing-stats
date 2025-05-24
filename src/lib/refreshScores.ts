import puppeteer from "puppeteer";
import prisma from "./primsa";

export async function refreshScores() {
  const users = await prisma.user.findMany({
    where: {
      mtUrl: {
        not: null,
      },
    },
    select: {
      discordId: true,
      mtUrl: true,
    },
  });

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  const results = [];

  for (const user of users) {
    try {
      const username = user.mtUrl;
      if (!username) continue;

      await page.goto(`https://monkeytype.com/profile/${username}`, {
        waitUntil: "networkidle2",
      });
      await page.waitForSelector(".pbsTime", { timeout: 5000 });

      const data = await page.evaluate(() => {
        const extractNum = (selector: string) => {
          const el = document.querySelector(selector);
          if (!el) return null;
          const match = el.textContent?.match(/(\d+(\.\d+)?)/);
          return match ? parseFloat(match[1]) : null;
        };

        return {
          wpm15: extractNum("#pageProfile > div > div.profile > div.pbsTime > div:nth-child(1) > div.fullTest > div:nth-child(2)"),
          raw15: extractNum("#pageProfile > div > div.profile > div.pbsTime > div:nth-child(1) > div.fullTest > div:nth-child(3)"),
          acc15: extractNum("#pageProfile > div > div.profile > div.pbsTime > div:nth-child(1) > div.fullTest > div:nth-child(4)"),

          wpm30: extractNum("#pageProfile > div > div.profile > div.pbsTime > div:nth-child(2) > div.fullTest > div:nth-child(2)"),
          raw30: extractNum("#pageProfile > div > div.profile > div.pbsTime > div:nth-child(2) > div.fullTest > div:nth-child(3)"),
          acc30: extractNum("#pageProfile > div > div.profile > div.pbsTime > div:nth-child(2) > div.fullTest > div:nth-child(4)"),

          wpm60: extractNum("#pageProfile > div > div.profile > div.pbsTime > div:nth-child(3) > div.fullTest > div:nth-child(2)"),
          raw60: extractNum("#pageProfile > div > div.profile > div.pbsTime > div:nth-child(3) > div.fullTest > div:nth-child(3)"),
          acc60: extractNum("#pageProfile > div > div.profile > div.pbsTime > div:nth-child(3) > div.fullTest > div:nth-child(4)"),
        };
      });

      const scoreMap = [
        { type: "60", wpm: data.wpm60, raw: data.raw60, accuracy: data.acc60 },
        { type: "30", wpm: data.wpm30, raw: data.raw30, accuracy: data.acc30 },
        { type: "15", wpm: data.wpm15, raw: data.raw15, accuracy: data.acc15 },
      ];

      for (const s of scoreMap) {
        if (s.wpm !== null && !isNaN(s.wpm)) {
          await prisma.score.upsert({
            where: {
              userId_testType: {
                userId: user.discordId,
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
              userId: user.discordId,
              testType: s.type,
              wpm: s.wpm,
              raw: s.raw,
              accuracy: s.accuracy,
            },
          });
        }
      }

      results.push({ username, scores: scoreMap });
    } catch (err) {
      console.error(`Failed for user ${user.mtUrl}:`, err);
    }
  }

  await browser.close();

  return true;
}
