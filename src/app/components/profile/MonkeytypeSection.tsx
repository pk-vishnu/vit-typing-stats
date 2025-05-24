"use client";
interface Props {
    editMode: boolean;
    mtUrl: string;
    setMtUrl: (v: string) => void;
    handleVerifyMt: () => void;
    mtVerified: boolean;
}

export default function MonkeytypeSection({ editMode, mtUrl, setMtUrl, mtVerified, handleVerifyMt }: Props) {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="w-15 h-15 rounded-xl overflow-hidden">
                    <img src="/mtLogo.png" alt="Logo" className="w-full h-full object-cover" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-white">Monkeytype Verification</h3>
                    <p className="text-sm text-gray-400">
                        Add <code className="text-yellow-300">[VIT]</code> to your Monkeytype bio and submit your username.
                    </p>
                </div>
            </div>

            {/* Status Badge */}
            <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400 font-medium">Verification Status</span>
                {mtVerified ? (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 border border-green-500/30 rounded-lg">
                        <span className="text-green-400 text-sm">✅</span>
                        <span className="text-green-300 text-sm font-medium">Verified</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 border border-red-500/30 rounded-lg">
                        <span className="text-red-400 text-sm">❌</span>
                        <span className="text-red-300 text-sm font-medium">Not Verified</span>
                    </div>
                )}
            </div>

            {/* Username Input */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Monkeytype Username</label>
                {editMode ? (
                    <>
                        <input
                            value={mtUrl}
                            onChange={(e) => setMtUrl(e.target.value)}
                            placeholder="e.g. yourMonkeytypeUsername"
                            className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 focus:outline-none transition-all duration-200"
                        />
                        <button
                            onClick={handleVerifyMt}
                            className="mt-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-medium rounded-lg hover:from-yellow-600 hover:to-orange-600 transform hover:scale-105 transition-all duration-200 shadow-lg shadow-yellow-400/20"
                        >
                            {mtVerified ? 'Re-Verify' : 'Verify MT Profile'}
                        </button>
                    </>
                ) : (
                    <div className="bg-gray-800/30 rounded-xl px-4 py-3 border border-gray-700/30">
                        <p className="text-gray-200 font-mono">{mtUrl || "No username provided"}</p>
                    </div>
                )}
            </div>

            {/* Info Box */}
            {!mtVerified && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                        <span className="text-yellow-400 text-lg">💡</span>
                        <div>
                            <h4 className="text-yellow-300 font-medium text-sm mb-1">Why verify your Monkeytype profile?</h4>
                            <ul className="text-yellow-200/80 text-xs space-y-1">
                                <li>• Appear in VIT-specific leaderboards</li>
                                <li>• Showcase your speed with a verified badge</li>
                                <li>• Join VIT-only typing races</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>

    );
}
