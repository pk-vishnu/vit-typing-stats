import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import prisma from "@/lib/primsa";
import nodemailer from "nodemailer";

export async function POST(req: Request){
    const session = await getServerSession(authOptions);
    if(!session) return NextResponse.json({error: "Unauthorized"}, {status: 401});

    const {email} = await req.json();
    if(!email.endsWith("@vitstudent.ac.in")){
        return NextResponse.json({error: "Please use your VIT student email."}, {status: 400});
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    await prisma.user.update({
        where:{
            discordId: session.user.id,
        },
        data:{
            collegeEmail: email,
            collegeCode:code,
        }
    })
    console.log(process.env.EMAIL_USER, process.env.EMAIL_PASS);
    // send mail with code
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
        },
    });

    await transporter.sendMail({
        from: `"VIT Typing Club" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Your Email Verification Code",
        text: `Your verification code is: ${code}`,
    });

    return NextResponse.json({ message: "Verification code sent" });
}
