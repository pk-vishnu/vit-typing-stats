"use client";
interface Props {
    editMode: boolean;
    email: string;
    setEmail: (v: string) => void;
    collegeVerified: boolean;
    handleVerifyEmail: () => void;
    verificationCode: string;
    setVerificationCode: (v: string) => void;
    handleConfirmCode: () => void;
}

export default function CollegeEmailSection({
    editMode,
    email,
    setEmail,
    collegeVerified,
    handleVerifyEmail,
    verificationCode,
    setVerificationCode,
    handleConfirmCode,
}: Props) {
    return (
        <div className="my-6 border-t pt-4">
            <label className="block text-sm">College Email</label>
            {editMode ? (
                <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-gray-300 p-1 rounded"
                />
            ) : (
                <p>{email}</p>
            )}

            <div className="mt-2">
                {collegeVerified ? (
                    <span className="text-green-600 text-sm">✅ College Verified</span>
                ) : (
                    <span className="text-red-600 text-sm">❌ Not Verified</span>
                )}
            </div>

            {!collegeVerified && editMode && (
                <div className="mt-4">
                    <button onClick={handleVerifyEmail} className="btn">Send Verification Code</button>
                    <label className="block text-sm">College Verification Code</label>
                    <input
                        type="text"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        className="w-full border border-gray-300 p-1 rounded"
                    />
                    <button onClick={handleConfirmCode} className="btn mt-2">Confirm Code</button>
                </div>
            )}
        </div>
    );
}
