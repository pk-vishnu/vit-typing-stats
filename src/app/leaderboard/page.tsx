"use client";

import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
const TEST_TYPES = ["60", "30", "15"];
const REFRESH_COOLDOWN_MS = 2 * 60 * 1000;

type ScoreWithUser = {
    wpm: number;
    accuracy: number | null;
    raw: number | null;
    testType: string;
    user: {
        discordId: string;
        displayname: string | null;
        username: string;
        avatarUrl: string | null;
        mtVerified: boolean;
        collegeVerified: boolean;
    };
};

type CacheStats = {
    lastUpdate: number;
    userCount: number;
    freshDataCount: number;
    nextUpdateIn: number;
    isUpdating: boolean;
};

export default function LeaderboardPage() {
    const [testType, setTestType] = useState("60");
    const [scores, setScores] = useState<ScoreWithUser[]>([]);
    const [cacheStats, setCacheStats] = useState<CacheStats | null>(null);
    const [canRefresh, setCanRefresh] = useState(true);
    const [cooldownRemaining, setCooldownRemaining] = useState(0);

    useEffect(() => {
        const toastId = "loading-scores";
        toast.loading("Loading Leaderboard...", { id: toastId });
        const fetchScores = async () => {
            try {
                const res = await fetch(`/api/leaderboard?testType=${testType}`);
                if (res.ok) {
                    const data = await res.json();
                    setScores(data.scores);
                    setCacheStats(data.meta?.cacheStats || null);
                    toast.dismiss(toastId);
                    toast.success("Scores loaded successfully!", { id: toastId });
                } else {
                    setScores([]);
                    setCacheStats(null);
                }
            } catch (error) {
                toast.dismiss(toastId);
                console.log("Error fetching scores:", error);
                toast.error("Something went wrong.", { id: toastId });
                setScores([]);
                setCacheStats(null);
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
            const res = await fetch("/api/update-personal-score", { method: "POST" });
            const data = await res.json();
            if (!res.ok) throw new Error();
            toast.success("Scores refreshed!", { id: toastId });
            localStorage.setItem("lastRefresh", Date.now().toString());
            setCanRefresh(false);
            setCooldownRemaining(REFRESH_COOLDOWN_MS);
            console.log(data.message);
        } catch {
            toast.error("Failed to refresh", { id: toastId });
        }
    };

    return (
        <>
            <Navbar />
            <Toaster />
            <div className="min-h-screen bg-neutral-950">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    {/* Header Section */}
                    <div className="mb-12">
                        <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
                            Leaderboard
                        </h1>
                        <p className="text-neutral-400 text-base">
                            Top 50 fastest typists at Vellore Institute of Technology
                        </p>
                    </div>

                    {/* Controls Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                        {/* Test Type Selector */}
                        <div className="flex gap-2">
                            {TEST_TYPES.map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setTestType(type)}
                                    className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-all ${testType === type
                                        ? "bg-white text-neutral-950"
                                        : "bg-neutral-900 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-300"
                                        }`}
                                >
                                    {type}s
                                </button>
                            ))}
                        </div>

                        {/* Refresh Button */}
                        <button
                            onClick={handleManualRefresh}
                            disabled={!canRefresh}
                            className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-all ${canRefresh
                                ? "bg-neutral-900 text-neutral-300 hover:bg-neutral-800"
                                : "bg-neutral-900/50 text-neutral-600 cursor-not-allowed"
                                }`}
                        >
                            {canRefresh
                                ? "Refresh Scores"
                                : `Cooldown: ${Math.ceil(cooldownRemaining / 1000)}s`}
                        </button>
                    </div>

                    {/* Leaderboard Table */}
                    <div className="bg-black rounded-xl border border-neutral-900 overflow-hidden shadow-inner" style={{ boxShadow: 'inset 0 1px 3px 0 rgba(0, 0, 0, 0.5)' }}>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-neutral-950 border-b border-neutral-900">
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                                            Rank
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                                            User
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                                            WPM
                                        </th>
                                        <th className="hidden sm:table-cell px-6 py-4 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                                            Raw
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                                            Accuracy
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-900">
                                    {scores.map((score, i) => (
                                        <tr
                                            key={i}
                                            className="hover:bg-neutral-950 transition-colors"
                                        >
                                            {/* Rank */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    {i < 3 ? (
                                                        <div className="relative">
                                                            <div
                                                                className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm relative z-10 ${i === 0
                                                                    ? "bg-amber-400 text-amber-950 shadow-lg shadow-amber-500/20"
                                                                    : i === 1
                                                                        ? "bg-slate-300 text-slate-900 shadow-lg shadow-slate-400/20"
                                                                        : "bg-amber-600 text-amber-950 shadow-lg shadow-amber-600/20"
                                                                    }`}
                                                            >
                                                                {i + 1}
                                                            </div>
                                                            {i === 0 && (
                                                                <div className="absolute inset-0 bg-amber-400 rounded-lg blur-sm opacity-30 animate-pulse"></div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-neutral-500 font-semibold text-sm w-9 h-9 flex items-center justify-center bg-neutral-900 rounded-lg">
                                                            {i + 1}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* User */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex-shrink-0">
                                                        {score.user.avatarUrl ? (
                                                            <img
                                                                src={score.user.avatarUrl}
                                                                alt="avatar"
                                                                className="w-10 h-10 rounded-full"
                                                            />
                                                        ) : (
                                                            <Link href={`/profiles/${score.user.username}`}>
                                                                <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center cursor-pointer hover:bg-neutral-700 transition-colors">
                                                                    <span className="text-neutral-300 font-semibold text-sm">
                                                                        {(score.user.displayname || score.user.username).charAt(0).toUpperCase()}
                                                                    </span>
                                                                </div>
                                                            </Link>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <Link href={`/profiles/${score.user.username}`}>
                                                                <span className="text-white font-medium text-base hover:text-neutral-300 transition-colors cursor-pointer">
                                                                    {score.user.displayname || score.user.username}
                                                                </span>
                                                            </Link>
                                                            <div className="flex gap-1.5">
                                                                {score.user.mtVerified && (
                                                                    <span
                                                                        className="text-green-400 text-xs"
                                                                        title="Verified Monkeytype account"
                                                                    >
                                                                        <div className="w-5 h-5 overflow-hidden">
                                                                            <img src="/mtLogo.png" alt="Monkeytype" className="w-full h-full object-cover" />
                                                                        </div>
                                                                    </span>
                                                                )}
                                                                {score.user.collegeVerified && (
                                                                    <span
                                                                        className="text-blue-400 text-xs"
                                                                        title="Verified VIT College Email"
                                                                    >
                                                                        <div className="w-5 h-5 overflow-hidden">
                                                                            <img src="/verified.png" alt="Verified" className="w-full h-full object-cover" />
                                                                        </div>
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* WPM */}
                                            <td className="px-6 py-4">
                                                <span className="text-white font-bold text-xl">
                                                    {score.wpm}
                                                </span>
                                            </td>

                                            {/* Raw */}
                                            <td className="hidden sm:table-cell px-6 py-4">
                                                <span className="text-neutral-400 font-medium">
                                                    {score.raw ?? "—"}
                                                </span>
                                            </td>

                                            {/* Accuracy */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-neutral-300 font-medium min-w-[3rem]">
                                                        {score.accuracy ? `${score.accuracy}%` : "—"}
                                                    </span>
                                                    {score.accuracy && (
                                                        <div className="w-20 bg-neutral-800 rounded-full h-2">
                                                            <div
                                                                className="bg-emerald-500 h-2 rounded-full transition-all"
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
                            <div className="text-center py-20">
                                <div className="text-6xl mb-4 opacity-10">⌨️</div>
                                <p className="text-neutral-500 text-lg font-medium">No scores found</p>
                                <p className="text-neutral-600 text-sm mt-2">Be the first to set a record!</p>
                            </div>
                        )}
                    </div>

                    {/* Footer Stats */}
                    <div className="mt-6 text-center">
                        <p className="text-neutral-600 text-sm">
                            Showing top {scores.length} players • Updated automatically every 2 minutes
                            {cacheStats && cacheStats.isUpdating ? " (Updating...)" : ""}
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}