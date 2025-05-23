import prisma from "@/lib/primsa";
import { notFound } from "next/navigation";
import Image from "next/image";
import Navbar from "@/app/components/Navbar";

export default async function UserProfile({ params }: { params: { id: string } }) {
    const user = await prisma.user.findUnique({
        where: { discordId: params.id },
        include: { scores: true },
    });

    if (!user) return notFound();

    const socialLinks = [
        { label: "LinkedIn", url: user.linkedinUrl },
        { label: "Twitter/X", url: user.XUrl },
        { label: "Instagram", url: user.instagramUrl },
        { label: "GitHub", url: user.githubUrl },
        { label: "Monkeytype", url: user.mtUrl ? `https://monkeytype.com/profile/${user.mtUrl}` : null },
    ];

    return (
        <>
            <Navbar />
            <div className="max-w-2xl mx-auto p-4 space-y-4">
                <div className="flex items-center space-x-4">
                    {user.avatarUrl && (
                        <Image
                            src={user.avatarUrl}
                            alt="Avatar"
                            width={64}
                            height={64}
                            className="rounded-full"
                        />
                    )}
                    <div>
                        <h1 className="text-2xl font-bold">
                            {user.displayname || user.username}
                            {user.mtVerified && (
                                <span title="Monkeytype Verified" className="text-green-500 ml-2">💎</span>
                            )}
                            {user.collegeVerified && (
                                <span title="VIT Email Verified" className="text-blue-500 ml-1">☑️</span>
                            )}
                        </h1>
                        <p className="text-gray-500 text-sm">Discord ID: {user.discordId}</p>
                        {user.collegeEmail && (
                            <p className="text-gray-500 text-sm">College Email: {user.collegeEmail}</p>
                        )}
                    </div>
                </div>

                <div>
                    <h2 className="text-lg font-semibold mt-4">Socials & Profiles</h2>
                    <ul className="list-disc ml-5">
                        {socialLinks.map(({ label, url }) =>
                            url ? (
                                <li key={label}>
                                    <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                                        {label}
                                    </a>
                                </li>
                            ) : null
                        )}
                    </ul>
                </div>

                <div>
                    <h2 className="text-lg font-semibold mt-4">Typing Scores</h2>
                    <div className="space-y-2">
                        {user.scores.map((score) => (
                            <div key={score.testType} className="border p-2 rounded-md shadow-sm">
                                <div className="font-medium">{score.testType}s</div>
                                <div>WPM: {score.wpm}</div>
                                <div>Raw: {score.raw ?? "N/A"}</div>
                                <div>Accuracy: {score.accuracy ?? "N/A"}%</div>
                                <div className="text-xs text-gray-400">Last Updated: {score.createdAt.toLocaleString()}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
