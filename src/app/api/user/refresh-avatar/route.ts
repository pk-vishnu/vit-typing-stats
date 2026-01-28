import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/primsa";

export async function POST() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const discordId = session.user.id;
  const avatarHash = session.user.image?.split("/").pop()?.split(".")[0];

  let avatarUrl: string;

  if (avatarHash) {
    const format = avatarHash.startsWith("a_") ? "gif" : "png";
    avatarUrl = `https://cdn.discordapp.com/avatars/${discordId}/${avatarHash}.${format}`;
  } else {
    const index = Math.floor(parseInt(discordId) / Math.pow(2, 22)) % 6;
    avatarUrl = `https://cdn.discordapp.com/embed/avatars/${index}.png`;
  }

  await prisma.user.update({
    where: { discordId },
    data: { avatarUrl },
  });

  return NextResponse.json({
    url: avatarUrl,
    message: "Avatar synced",
  });
}
