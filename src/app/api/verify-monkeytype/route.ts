/* For local development, puppeteer works cuz chrome is installed */

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

/* using puppeteer-core and serverless chromium for prod */
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
    let bioText: string | null = null;
    try {
      bioText = await fetchBioViaAPI(username);
      console.log(`API verification successful for ${username}`);
    } catch (apiError) {
      console.error(`API verification failed for ${username}:`, apiError);
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`Skipping scraping fallback in development for ${username}`);
        return NextResponse.json({ 
          error: "API verification failed and scraping disabled in development. Please try again later." 
        }, { status: 500 });
      }
      
      console.log(`Falling back to scraping for ${username}...`);
      bioText = await fetchBioViaScraping(username);
    }

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

async function fetchBioViaAPI(username: string): Promise<string | null> {
  console.log(`Fetching bio for ${username} via API...`);
  
  const response = await fetch(`https://api.monkeytype.com/users/${username}/profile`, {
    headers: {
      'User-Agent': 'VIT-Typing-Stats/1.0',
    },
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`API Error for ${username}: ${response.status} ${response.statusText} - ${errorText}`);
    throw new Error(`Monkeytype API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  console.log(`API Response for ${username}:`, {
    hasData: !!data.data,
    hasDetails: !!data.data?.details,
    hasBio: !!data.data?.details?.bio,
    bio: data.data?.details?.bio,
  });
  
  if (!data.data) {
    console.error(`No user data for ${username}:`, data);
    throw new Error('No user data found in API response');
  }
  return data.data.details?.bio || null;
}

async function fetchBioViaScraping(username: string): Promise<string | null> {
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath(),
    headless: chromium.headless,
  });

  try {
    const page = await browser.newPage();
    
    await page.goto(`https://monkeytype.com/profile/${username}`, {
      waitUntil: "networkidle2",
    });
    
    const bioText = await page.$eval(".bio .value", (el) => el.textContent?.trim());
    return bioText;

  } finally {
    await browser.close();
  }
}