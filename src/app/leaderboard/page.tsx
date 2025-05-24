"use client";

import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
const TEST_TYPES = ["60", "30", "15"];
const REFRESH_COOLDOWN_MS = 5 * 60 * 1000;

export default function LeaderboardPage() {
    const [testType, setTestType] = useState("60");
    const [scores, setScores] = useState([]);
    const [loading, setLoading] = useState(false);
    const [canRefresh, setCanRefresh] = useState(true);
    const [cooldownRemaining, setCooldownRemaining] = useState(0);

    useEffect(() => {
        setLoading(true);
        const fetchScores = async () => {
            try {
                const res = await fetch(`/api/leaderboard?testType=${testType}`);
                if (res.ok) {
                    const data = await res.json();
                    setScores(data.scores);
                } else {
                    setScores([]);
                }
            } catch (error) {
                console.error("Fetch error:", error);
                setScores([]);
            } finally {
                setLoading(false);
            }
        };

        fetchScores();
    }, [testType]);

    useEffect(() => {
        const last = localStorage.getItem("lastRefresh");
        if (last) {
            const elapsed = Date.now() - parseInt(last);
            if (elapsed < REFRESH_COOLDOWN_MS) {
                setCanRefresh(false);
                setCooldownRemaining(REFRESH_COOLDOWN_MS - elapsed);
            }
        }
    }, []);

    useEffect(() => {
        if (!canRefresh && cooldownRemaining > 0) {
            const interval = setInterval(() => {
                setCooldownRemaining(prev => {
                    if (prev <= 1000) {
                        clearInterval(interval);
                        setCanRefresh(true);
                        return 0;
                    }
                    return prev - 1000;
                });
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [canRefresh, cooldownRemaining]);

    const handleManualRefresh = async () => {
        const toastId = toast.loading("Refreshing scores...");
        try {
            const res = await fetch("/api/refresh-scores", { method: "POST" });
            if (!res.ok) throw new Error();
            toast.success("Scores refreshed!", { id: toastId });
            localStorage.setItem("lastRefresh", Date.now().toString());
            setCanRefresh(false);
            setCooldownRemaining(REFRESH_COOLDOWN_MS);
        } catch {
            toast.error("Failed to refresh", { id: toastId });
        }
    };

    return (
        <>
            <Navbar />
            <Toaster />
            <div className="min-h-screen bg-gradient-to-br from-gray-950 to-black">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header Section */}
                    <div className="text-center mb-6">
                        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-4">
                            Leaderboards
                        </h1>
                        <p className="text-gray-400 text-sm sm:text-base font-mono max-w-2xl mx-auto">
                            Top 50 Fastest Typists in Vellore Institute of Technology
                        </p>
                    </div>

                    {/* Test Type Selector */}
                    <div className="flex flex-wrap justify-center gap-2 mb-8">
                        {TEST_TYPES.map((type) => (
                            <button
                                key={type}
                                onClick={() => setTestType(type)}
                                className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 transform hover:scale-105 ${testType === type
                                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25"
                                    : "bg-gray-800/50 text-gray-300 hover:bg-gray-700/70 border border-gray-700/50"
                                    }`}
                            >
                                {type}s
                            </button>
                        ))}
                    </div>
                    <div className="flex justify-end mb-4">
                        <button
                            onClick={handleManualRefresh}
                            disabled={!canRefresh}
                            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 ${canRefresh
                                ? " hover:bg-gray-700 text-white"
                                : "bg-gray-700 text-gray-400 cursor-not-allowed"
                                }`}
                        >
                            {canRefresh
                                ? "Refresh Scores"
                                : `Cooldown: ${Math.ceil(cooldownRemaining / 1000)}s`}
                        </button>
                    </div>

                    {/* Leaderboard Table */}
                    <div className="bg-gray-900/30 backdrop-blur-sm rounded-2xl border border-gray-800/50 overflow-hidden shadow-2xl">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gradient-to-r from-gray-800/80 to-gray-900/80 backdrop-blur-sm">
                                        <th className="px-4 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold text-gray-300 uppercase tracking-wider">
                                            Rank
                                        </th>
                                        <th className="px-4 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold text-gray-300 uppercase tracking-wider">
                                            User
                                        </th>
                                        <th className="px-4 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold text-gray-300 uppercase tracking-wider">
                                            WPM
                                        </th>
                                        <th className="hidden sm:table-cell px-4 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold text-gray-300 uppercase tracking-wider">
                                            Raw
                                        </th>
                                        <th className="px-4 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold text-gray-300 uppercase tracking-wider">
                                            Accuracy
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800/50">
                                    {scores.map((score, i) => (
                                        <tr
                                            key={i}
                                            className="hover:bg-gray-800/30 transition-colors duration-200 group"
                                        >
                                            {/* Rank */}
                                            <td className="px-4 sm:px-6 py-4">
                                                <div className="flex items-center">
                                                    {i < 3 ? (
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${i === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-yellow-900' :
                                                            i === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-500 text-gray-900' :
                                                                'bg-gradient-to-r from-orange-400 to-orange-600 text-orange-900'
                                                            }`}>
                                                            {i + 1}
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400 font-mono text-sm w-8 text-center">
                                                            {i + 1}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* User */}
                                            <td className="px-4 sm:px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex-shrink-0">
                                                        {score.user.avatarUrl ? (
                                                            <img
                                                                src={score.user.avatarUrl}
                                                                alt="avatar"
                                                                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full ring-2 ring-gray-700 group-hover:ring-gray-600 transition-all duration-200"
                                                            />
                                                        ) : (
                                                            <Link href={`/profiles/${score.user.discordId}`}>
                                                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center ring-2 ring-gray-700 cursor-pointer">
                                                                    <span className="text-gray-300 font-semibold text-sm">
                                                                        {(score.user.displayname || score.user.username).charAt(0).toUpperCase()}
                                                                    </span>
                                                                </div>
                                                            </Link>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">

                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <Link href={`/profiles/${score.user.discordId}`}>
                                                                <span className="text-white font-medium text-sm sm:text-base hover:text-blue-400 transition-colors cursor-pointer truncate">
                                                                    {score.user.displayname || score.user.username}
                                                                </span>
                                                            </Link>
                                                            <div className="flex gap-1">
                                                                {score.user.mtVerified && (
                                                                    <span
                                                                        className="text-green-400 text-xs"
                                                                        title="Verified Monkeytype account"
                                                                    >
                                                                        <div className="w-8 h-8 overflow-hidden">
                                                                            <img src="/mtLogo.png" alt="Logo" className="w-full h-full object-cover" />
                                                                        </div>
                                                                    </span>
                                                                )}
                                                                {score.user.collegeVerified && (
                                                                    <span
                                                                        className="text-blue-400 text-xs"
                                                                        title="Verified VIT College Email"
                                                                    >
                                                                        <div className="w-8 h-8 overflow-hidden">
                                                                            <img src="/verified.png" alt="Logo" className="w-full h-full object-cover" />
                                                                        </div>
                                                                    </span>
                                                                )}
                                                            </div>

                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* WPM */}
                                            < td className="px-4 sm:px-6 py-4" >
                                                <span className="text-white font-bold text-lg sm:text-xl">
                                                    {score.wpm}
                                                </span>
                                            </td>

                                            {/* Raw - Hidden on mobile */}
                                            <td className="hidden sm:table-cell px-4 sm:px-6 py-4">
                                                <span className="text-gray-400 font-mono">
                                                    {score.raw ?? "—"}
                                                </span>
                                            </td>

                                            {/* Accuracy */}
                                            <td className="px-4 sm:px-6 py-4">
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                                    <span className="text-gray-300 font-medium">
                                                        {score.accuracy ? `${score.accuracy}%` : "—"}
                                                    </span>
                                                    {score.accuracy && (
                                                        <div className="w-full sm:w-16 bg-gray-700 rounded-full h-1.5">
                                                            <div
                                                                className="bg-gradient-to-r from-green-500 to-emerald-400 h-1.5 rounded-full transition-all duration-300"
                                                                style={{ width: `${score.accuracy}%` }}
                                                            ></div>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Empty State */}
                        {scores.length === 0 && (
                            <div className="text-center py-16">
                                <div className="text-6xl mb-4 opacity-20">⌨️</div>
                                <p className="text-gray-500 text-lg font-medium">No scores found</p>
                                <p className="text-gray-600 text-sm mt-2">Be the first to set a record!</p>
                            </div>
                        )}
                    </div>

                    {/* Footer Stats */}
                    <div className="mt-8 text-center">
                        <p className="text-gray-600 text-sm">
                            Showing top {scores.length} players • Updated in real-time
                        </p>
                    </div>
                </div >
            </div >
        </>
    );
}
