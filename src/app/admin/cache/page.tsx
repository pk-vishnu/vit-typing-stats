"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Navbar from "../../components/Navbar";
import { toast, Toaster } from "react-hot-toast";

type CacheUser = {
  discordId: string;
  mtUsername: string;
  lastFetched: number;
  fetchAttempts: number;
  lastError?: string;
  hasScores: boolean;
};

type CacheStats = {
  userCount: number;
  freshDataCount: number;
  staleDataCount: number;
  lastGlobalUpdate: number;
  cacheAge: number;
  isUpdating: boolean;
  nextUpdateIn: number;
};

export default function CacheMonitorPage() {
  const { data: session, status } = useSession();
  const [isAdmin, setIsAdmin] = useState(false);
  const [cacheStats, setCacheStats] = useState<CacheStats | null>(null);
  const [cacheUsers, setCacheUsers] = useState<CacheUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session && session.user) {
      if (session.user.id === process.env.NEXT_PUBLIC_ADMIN_ID) {
        setIsAdmin(true);
      }
    }
  }, [session]);

  useEffect(() => {
    if (isAdmin) {
      fetchCacheData();
      const interval = setInterval(fetchCacheData, 5000);
      return () => clearInterval(interval);
    }
  }, [isAdmin]);

  const fetchCacheData = async () => {
    try {
      const res = await fetch("/api/monkeytype-cache");
      if (res.ok) {
        const data = await res.json();
        setCacheStats(data.stats);
        setCacheUsers(data.users);
      }
    } catch (error) {
      console.error("Error fetching cache data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleForceUpdate = async () => {
    const toastId = toast.loading("Forcing cache update...");
    try {
      const res = await fetch("/api/monkeytype-cache", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "force-update" }),
      });

      if (res.ok) {
        toast.success("Cache update triggered!", { id: toastId });
        fetchCacheData();
      } else {
        toast.error("Failed to trigger update", { id: toastId });
      }
    } catch (error) {
      toast.error("Error triggering update", { id: toastId });
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 to-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 to-black flex items-center justify-center">
        <div className="text-white">Access denied.</div>
      </div>
    );
  }

  const formatTimeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return minutes > 0 ? `${minutes}m ${seconds}s ago` : `${seconds}s ago`;
  };

  return (
    <>
      <Navbar />
      <Toaster />
      <div className="min-h-screen bg-gradient-to-br from-gray-950 to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Cache Monitor</h1>
            <p className="text-gray-400">Monitor Monkeytype data cache performance</p>
          </div>

          {cacheStats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
                <h3 className="text-lg font-semibold text-white mb-4">Cache Status</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Users:</span>
                    <span className="text-white font-mono">{cacheStats.userCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Fresh Data:</span>
                    <span className="text-green-400 font-mono">{cacheStats.freshDataCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Stale Data:</span>
                    <span className="text-yellow-400 font-mono">{cacheStats.staleDataCount}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
                <h3 className="text-lg font-semibold text-white mb-4">Timing</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Last Update:</span>
                    <span className="text-white font-mono text-sm">
                      {formatTimeAgo(cacheStats.lastGlobalUpdate)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Next Update:</span>
                    <span className="text-blue-400 font-mono">
                      {Math.ceil(cacheStats.nextUpdateIn / 1000)}s
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status:</span>
                    <span className={`font-mono ${cacheStats.isUpdating ? 'text-yellow-400' : 'text-green-400'}`}>
                      {cacheStats.isUpdating ? 'Updating...' : 'Idle'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
                <h3 className="text-lg font-semibold text-white mb-4">Actions</h3>
                <button
                  onClick={handleForceUpdate}
                  disabled={cacheStats.isUpdating}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                >
                  {cacheStats.isUpdating ? 'Updating...' : 'Force Update'}
                </button>
              </div>
            </div>
          )}

          {/* User List */}
          <div className="bg-gray-900/50 rounded-xl border border-gray-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-800">
              <h3 className="text-lg font-semibold text-white">User Cache Status</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-800/50">
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-300">Username</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-300">Last Fetched</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-300">Attempts</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-300">Scores</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-300">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {cacheUsers.map((user) => (
                    <tr key={user.discordId} className="hover:bg-gray-800/30">
                      <td className="px-6 py-4">
                        <span className="text-white font-mono text-sm">{user.mtUsername}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-400 text-sm">
                          {formatTimeAgo(user.lastFetched)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-sm font-mono ${user.fetchAttempts > 0 ? 'text-yellow-400' : 'text-green-400'}`}>
                          {user.fetchAttempts}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-sm ${user.hasScores ? 'text-green-400' : 'text-red-400'}`}>
                          {user.hasScores ? '✓' : '✗'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {user.lastError ? (
                          <span className="text-red-400 text-sm" title={user.lastError}>
                            Error
                          </span>
                        ) : (
                          <span className="text-green-400 text-sm">OK</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
