import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/primsa";
import { authOptions } from "../auth/[...nextauth]/route";

// GET req to fetch user data using DiscordID(which you can get from session)
export async function GET(req:Request){
    const session = await getServerSession(authOptions);
    if(!session) return NextResponse.json({error: "Unauthorized"}, {status: 401});
    const user = await prisma.user.findUnique({
        where:{
            discordId: session.user.id,
        },
        select:{
            collegeEmail: true,
            collegeVerified: true,
            mtUrl: true,
            mtVerified: true,
            displayname: true,  
            username: true,
            linkedinUrl: true,
            instagramUrl: true,
            XUrl: true,
            githubUrl: true,
        }
    })
    return NextResponse.json(user);
}

// PATCH req to update user data
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  // Only allow updating these fields (safe fields)
  const {
    collegeEmail,
    mtUrl,
    displayname,
    username,
    linkedinUrl,
    instagramUrl,
    XUrl,
    githubUrl,
  } = body;

  try {
    const user = await prisma.user.update({
      where: {
        discordId: session.user.id,
      },
      data: {
        collegeEmail,
        mtUrl,
        displayname,
        username,
        linkedinUrl,
        instagramUrl,
        XUrl,
        githubUrl,
      },
    });

    return NextResponse.json({ message: "User updated successfully", user });
  } catch (error) {
    console.error("User update failed:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}