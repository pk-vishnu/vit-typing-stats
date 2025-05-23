import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import prisma from "@/lib/primsa";
import puppeteer from "puppeteer";

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
      headless: true,
    });
    const page = await browser.newPage();
    await page.goto(`https://monkeytype.com/profile/${username}`, {
      waitUntil: "networkidle2",
    });
    const bioText = await page.$eval(".bio .value", el => el.textContent?.trim());
    console.log("Bio Text:", bioText);
    await browser.close();

    if (!bioText || !bioText.includes("[VIT]")) {
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