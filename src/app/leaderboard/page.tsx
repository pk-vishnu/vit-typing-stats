"use client";

import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Link from "next/link";

const TEST_TYPES = ["60", "30", "15"];

export default function LeaderboardPage() {
    const [testType, setTestType] = useState("60");
    const [scores, setScores] = useState([]);

    useEffect(() => {
        const fetchScores = async () => {
            const res = await fetch(`/api/leaderboard?testType=${testType}`);
            if (res.ok) {
                const data = await res.json();
                setScores(data.scores);
            } else {
                setScores([]);
            }
        };

        fetchScores();
    }, [testType]);

    return (
        <>
            <Navbar />
            <div className="max-w-3xl mx-auto p-6">
                <h1 className="text-2xl font-bold mb-4 text-center">Leaderboard</h1>

                <div className="flex justify-center gap-4 mb-6">
                    {TEST_TYPES.map((type) => (
                        <button
                            key={type}
                            onClick={() => setTestType(type)}
                            className={`px-4 py-2 rounded-md font-semibold ${testType === type
                                ? "bg-gray-900 text-white"
                                : "bg-gray-700 hover:bg-gray-300"
                                }`}
                        >
                            {type}s
                        </button>
                    ))}
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full table-auto border-collapse">
                        <thead>
                            <tr className="bg-gray-900 text-left text-sm uppercase">
                                <th className="px-4 py-2">Rank</th>
                                <th className="px-4 py-2">User</th>
                                <th className="px-4 py-2">WPM</th>
                                <th className="px-4 py-2">Raw</th>
                                <th className="px-4 py-2">Accuracy</th>
                            </tr>
                        </thead>
                        <tbody>
                            {scores.map((score, i) => (
                                <tr key={i} className="border-b">
                                    <td className="px-4 py-2 font-mono">{i + 1}</td>
                                    <td className="px-4 py-2 flex items-center gap-2">
                                        {score.user.avatarUrl && (
                                            <img
                                                src={score.user.avatarUrl}
                                                alt="avatar"
                                                className="w-6 h-6 rounded-full"
                                            />
                                        )}
                                        <Link href={`/profiles/${score.user.discordId}`}>
                                            <span className="hover:underline cursor-pointer">
                                                {score.user.displayname || score.user.username}
                                                {score.user.mtVerified && (
                                                    <span className="text-green-500 text-sm ml-1" title="Verified Monkeytype account">💎</span>
                                                )}
                                                {score.user.collegeVerified && (
                                                    <span className="text-blue-500 text-sm ml-1" title="Verified VIT College Email">☑️</span>
                                                )}
                                            </span>
                                        </Link>

                                    </td>
                                    <td className="px-4 py-2 font-bold">{score.wpm}</td>
                                    <td className="px-4 py-2 text-gray-700">{score.raw ?? "—"}</td>
                                    <td className="px-4 py-2 text-gray-700">
                                        {score.accuracy ? `${score.accuracy}%` : "—"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {scores.length === 0 && (
                        <p className="text-center text-gray-500 py-4">No scores found.</p>
                    )}
                </div>
            </div>
        </>
    );
}
