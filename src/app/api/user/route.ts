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
    const existingUser = await prisma.user.findUnique({
      where: {
        discordId: session.user.id,
      },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isMtUrlChanged = mtUrl && mtUrl !== existingUser.mtUrl;
    const isCollegeEmailChanged = collegeEmail && collegeEmail !== existingUser.collegeEmail;

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
        ...(isMtUrlChanged && { mtVerified: false }),
        ...(isCollegeEmailChanged && { collegeVerified: false }),
      },
    });

    return NextResponse.json({ message: "User updated successfully", user });
  } catch (error) {
    console.error("User update failed:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

// DELETE req to delete user data
export async function DELETE(req: Request){
    const session = await getServerSession(authOptions);
    if(!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    try{
      await prisma.score.deleteMany({
        where:{
          userId: session.user.id,
        }
      });

      await prisma.user.delete({
        where:{
          discordId: session.user.id,
        }
      });
      return NextResponse.json({ message: "User Deleted Successfully."});
    }catch(error){
      console.error("User deletion failed:", error);
      return NextResponse.json({ error: "Deletion failed" }, { status: 500 });
    } 
}