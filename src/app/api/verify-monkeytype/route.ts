// import { NextResponse } from "next/server";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth";
// import prisma from "@/lib/primsa";
// import puppeteer from "puppeteer";

// export async function POST(req: Request) {
//   const session = await getServerSession(authOptions);
//   if (!session) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   const { username } = await req.json();
//   if (!username) {
//     return NextResponse.json({ error: "Username is required" }, { status: 400 });
//   }

//   try {
//     const browser = await puppeteer.launch({
//       headless: true,
//     });
//     const page = await browser.newPage();
//     await page.goto(`https://monkeytype.com/profile/${username}`, {
//       waitUntil: "networkidle2",
//     });
//     const bioText = await page.$eval(".bio .value", el => el.textContent?.trim());
//     await browser.close();

//     if (!bioText || !bioText.includes("[VIT]")) {
//       await prisma.user.update({
//         where: { discordId: session.user.id },
//         data: {
//           mtUrl: null,
//           mtVerified: false,
//         }
//       });
//       return NextResponse.json({ error: "Verification tag '[VIT]' not found in bio." }, { status: 400 });
//     }

//     await prisma.user.update({
//       where: { discordId: session.user.id },
//       data: {
//         mtUrl: username,
//         mtVerified: true,
//       },
//     });

//     return NextResponse.json({ message: "Monkeytype verified successfully" });

//   } catch (err) {
//     console.error("Monkeytype verification error:", err);
//     return NextResponse.json({ error: "Failed to verify Monkeytype profile." }, { status: 500 });
//   }
// }

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/primsa";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { username } = await req.json();
  if (!username) {
    return NextResponse.json({ error: "Username is required" }, { status: 400 });
  }

  try {
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    
    await page.goto(`https://monkeytype.com/profile/${username}`, {
      waitUntil: "networkidle2",
    });
    
    const bioText = await page.$eval(".bio .value", (el) => el.textContent?.trim());
    await browser.close();

    if (!bioText || !bioText.includes("[VIT]")) {
      await prisma.user.update({
        where: { discordId: session.user.id },
        data: {
          mtUrl: null,
          mtVerified: false,
        }
      });
      return NextResponse.json({ error: "Verification tag '[VIT]' not found in bio." }, { status: 400 });
    }

    await prisma.user.update({
      where: { discordId: session.user.id },
      data: {
        mtUrl: username,
        mtVerified: true,
      },
    });

    return NextResponse.json({ message: "Monkeytype verified successfully" });

  } catch (err) {
    console.error("Monkeytype verification error:", err);
    return NextResponse.json({ error: "Failed to verify Monkeytype profile." }, { status: 500 });
  }
}