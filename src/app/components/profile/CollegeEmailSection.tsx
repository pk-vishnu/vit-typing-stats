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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="w-15 h-15 rounded-xl overflow-hidden">
                    <img src="/VITLogo.png" alt="Logo" className="w-full h-full object-cover bg-white" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-white">VIT Mail Verification</h3>
                    <p className="text-sm text-gray-400">
                        Verify your VIT email to unlock exclusive features
                    </p>
                </div>
            </div>

            {/* Status Badge */}
            <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400 font-medium">Verification Status</span>
                {collegeVerified ? (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 border border-green-500/30 rounded-lg">
                        <span className="text-green-400 text-sm">✅</span>
                        <span className="text-green-300 text-sm font-medium">College Verified</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 border border-red-500/30 rounded-lg">
                        <span className="text-red-400 text-sm">❌</span>
                        <span className="text-red-300 text-sm font-medium">Not Verified</span>
                    </div>
                )}
            </div>

            {/* Email Input */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">VIT Email Address</label>
                {editMode ? (
                    <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your.name@vitstudent.ac.in"
                        className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-200"
                    />
                ) : (
                    <div className="bg-gray-800/30 rounded-xl px-4 py-3 border border-gray-700/30">
                        <p className="text-gray-200">{email || "No email provided"}</p>
                    </div>
                )}
            </div>

            {/* Verification Process */}
            {!collegeVerified && editMode && (
                <div className="space-y-4 bg-gray-800/20 rounded-xl p-4 border border-gray-700/30">
                    <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center mt-0.5">
                            <span className="text-blue-400 text-xs">1</span>
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-gray-300 mb-3">
                                Click below to send a verification code to your VIT email
                            </p>
                            <button
                                onClick={handleVerifyEmail}
                                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg shadow-blue-500/25"
                            >
                                Send Verification Code
                            </button>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center mt-0.5">
                            <span className="text-purple-400 text-xs">2</span>
                        </div>
                        <div className="flex-1 space-y-3">
                            <p className="text-sm text-gray-300">
                                Enter the verification code from your email
                            </p>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-400">Verification Code</label>
                                <input
                                    type="text"
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value)}
                                    placeholder="Enter 6-digit code"
                                    className="w-full bg-gray-800/50 border border-gray-700/50 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all duration-200"
                                />
                            </div>
                            <button
                                onClick={handleConfirmCode}
                                className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-200 shadow-lg shadow-purple-500/25"
                            >
                                Confirm Code
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Info Box */}
            {!collegeVerified && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                        <span className="text-blue-400 text-lg">💡</span>
                        <div>
                            <h4 className="text-blue-300 font-medium text-sm mb-1">Why verify your VIT email?</h4>
                            <ul className="text-blue-200/80 text-xs space-y-1">
                                <li>• Get the verified badge on leaderboards</li>
                                <li>• Access VIT-exclusive typing competitions</li>
                                <li>• Connect with verified VIT students</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
