import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/primsa";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { code } = await req.json();

  const user = await prisma.user.findUnique({
    where: { discordId: session.user.id },
  });

  if (user?.collegeCode !== code) {
    return NextResponse.json({ error: "Invalid verification code" }, { status: 400 });
  }

  await prisma.user.update({
    where: { discordId: session.user.id },
    data: {
      collegeVerified: true,
      collegeCode: null,
    },
  });

  return NextResponse.json({ message: "Email verified successfully" });
}
