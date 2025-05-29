import prisma from "@/lib/primsa";
import { notFound } from "next/navigation";
import Image from "next/image";
import Navbar from "@/app/components/Navbar";
import {
    Github,
    Twitter,
    Linkedin,
    Globe,
    Instagram,
} from "lucide-react";
import Link from "next/link";


const SocialIcon = ({ label }: { label: string }) => {
    switch (label.toLowerCase()) {
        case "github":
            return <Github size={18} />;
        case "twitter":
            return <Twitter size={18} />;
        case "linkedin":
            return <Linkedin size={18} />;
        case "instagram":
            return <Instagram size={18} />;
        default:
            return <Globe size={18} />;
    }
};

export default async function UserProfile({ params }: { params: Promise<{ id: string }> }) {
    const userId = (await params).id;
    const user = await prisma.user.findUnique({
        where: { discordId: userId },
        include: { scores: true },
    });

    if (!user) return notFound();

    const socialLinks = [
        {
            label: "LinkedIn",
            url: user.linkedinUrl ? `https://www.linkedin.com/in/${user.linkedinUrl}` : null,
        },
        {
            label: "Twitter/X",
            url: user.XUrl ? `https://twitter.com/${user.XUrl}` : null,
        },
        {
            label: "Instagram",
            url: user.instagramUrl ? `https://instagram.com/${user.instagramUrl}` : null,
        },
        {
            label: "GitHub",
            url: user.githubUrl ? `https://github.com/${user.githubUrl}` : null,
        },
        { label: "Monkeytype", url: user.mtUrl ? `https://monkeytype.com/profile/${user.mtUrl}` : null },
    ];

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gradient-to-br from-gray-950 to-black">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 text-white">
                    {/* Avatar and name */}
                    <div className="flex flex-col sm:flex-row items-center sm:items-start sm:space-x-6 space-y-4 sm:space-y-0">
                        {user.avatarUrl && (
                            <Image
                                src={user.avatarUrl}
                                alt="Avatar"
                                width={80}
                                height={80}
                                className="rounded-full object-cover border border-white/20"
                            />
                        )}
                        <div className="text-center sm:text-left">
                            <h1 className="text-3xl font-semibold flex items-center gap-2">
                                {user.displayname || user.username}
                                {user.mtVerified && <span
                                    className="text-green-400 text-xs"
                                    title="Verified Monkeytype account"
                                >
                                    <div className="w-8 h-8 overflow-hidden">
                                        <img src="/mtLogo.png" alt="Logo" className="w-full h-full object-cover" />
                                    </div>
                                </span>}
                                {user.collegeVerified && <span
                                    className="text-blue-400 text-xs"
                                    title="Verified VIT College Email"
                                >
                                    <div className="w-8 h-8 overflow-hidden">
                                        <img src="/verified.png" alt="Logo" className="w-full h-full object-cover" />
                                    </div>
                                </span>}
                                {user.discordId === "943148172853776414" && (
                                    <div
                                        className="w-full h-6 overflow-hidden"
                                        title="Reported or helped track down bugs in the Monkeytype Website"
                                    >
                                        <img
                                            src="/bugHunter.png"
                                            alt="Bug Hunter Badge"
                                            className="w-full h-full object-contained"
                                        />
                                    </div>
                                )}
                            </h1>
                            {user.collegeEmail && (
                                <p className="text-gray-400 text-sm mt-1">College Email: {user.collegeEmail}</p>
                            )}
                        </div>
                    </div>

                    {/* Socials */}
                    {socialLinks?.length > 0 && (
                        <div>
                            <h2 className="text-xl font-medium mb-4">Socials & Profiles</h2>
                            <div className="flex flex-wrap gap-4">
                                {socialLinks.map(({ label, url }) =>
                                    url ? (
                                        <Link
                                            key={label}
                                            href={url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black/40 hover:bg-black/60 transition backdrop-blur-sm border border-white/10 shadow-sm"
                                        >
                                            <SocialIcon label={label} />
                                            <span className="text-sm font-medium">{label}</span>
                                        </Link>
                                    ) : null
                                )}
                            </div>
                        </div>
                    )}

                    {/* Typing Scores */}
                    <div>
                        <h2 className="text-xl font-medium mb-4">Typing Scores</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {user.scores.map((score) => (
                                <div
                                    key={score.testType}
                                    className="rounded-2xl bg-black/40 backdrop-blur-sm p-4 border border-white/10 hover:bg-black/60 transition"
                                >
                                    <div className="font-semibold">{score.testType}s</div>
                                    <div className="text-gray-300">WPM: {score.wpm}</div>
                                    <div className="text-gray-300">Raw: {score.raw ?? "N/A"}</div>
                                    <div className="text-gray-300">Accuracy: {score.accuracy ?? "N/A"}%</div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        Last Updated: {score.createdAt.toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div >
        </>
    );
}

