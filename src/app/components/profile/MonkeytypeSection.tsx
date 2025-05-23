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
        <>
            <div className="mt-2">
                <h3 className="font-semibold">Monkeytype Verification</h3>
                <p className="text-sm text-gray-600">
                    Add <code>[VIT]</code> to your Monkeytype bio and submit your username above.
                </p>
            </div>
            <div className="mt-6 border-t pt-4">
                <label className="block text-sm">Monkeytype Username</label>
                {editMode ? (
                    <>
                        <input
                            value={mtUrl}
                            onChange={(e) => setMtUrl(e.target.value)}
                            className="w-full border border-gray-300 p-1 rounded"
                        />
                        {mtVerified ? (
                            <>
                                <span className="text-green-600 text-sm">✅ Verified</span>
                                <button onClick={handleVerifyMt} className="btn mt-2">Re-Verify</button>
                            </>
                        ) : (
                            <button onClick={handleVerifyMt} className="btn mt-2">Verify MT Profile</button>
                        )}
                    </>
                ) : (
                    <>
                        {mtVerified ? (
                            <>
                                <p className="text-sm font-mono">{mtUrl}</p>
                                <span className="text-green-600 text-sm">✅ Verified</span>
                            </>
                        ) : (
                            <span className="text-red-600 text-sm">❌ Not Verified</span>
                        )}
                    </>
                )}
            </div>
        </>
    );
}
