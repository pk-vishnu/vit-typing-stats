"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Link from "next/link";

export default function AdminPage() {
    const { data: session, status } = useSession();
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        if (session && session.user) {
            if (session.user.id === process.env.NEXT_PUBLIC_ADMIN_ID) {
                setIsAdmin(true);
            }
        }
    }, [session]);


    if (status === "loading") return <p>Loading...</p>;
    if (!isAdmin) return <p>Access denied.</p>;    const handleRefreshScores = async () => {
        const res = await fetch("/api/refresh-scores", { method: "POST" });
        if (res.ok) {
            alert("Cache update triggered!");
        } else {
            alert("Failed to trigger cache update.");
        }
    };

    const handleUpdateLeaderboard = async () => {
        alert("🚧 Leaderboard cache update not implemented yet.");
    };

    return (
        <>
            <Navbar />
            <div className="max-w-md mx-auto p-4">
                <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>                <button
                    onClick={handleRefreshScores}
                    className="btn mb-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
                >
                    🔁 Force Cache Update
                </button>

                <Link href="/admin/cache">
                    <button className="btn mb-4 w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded">
                        📊 Cache Monitor
                    </button>
                </Link>

                <button
                    onClick={handleUpdateLeaderboard}
                    className="btn w-full bg-gray-600 hover:bg-gray-700 text-white py-2 rounded"
                >
                    📦 Update Leaderboard Cache
                </button>
            </div>
        </>
    );
}
