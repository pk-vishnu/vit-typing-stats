"use client";
interface Props {
    editMode: boolean;
    displayname: string;
    linkedinUrl: string;
    instagramUrl: string;
    XUrl: string;
    githubUrl: string;
    setDisplayname: (v: string) => void;
    setLinkedinUrl: (v: string) => void;
    setInstagramUrl: (v: string) => void;
    setXUrl: (v: string) => void;
    setGithubUrl: (v: string) => void;
}

export default function BasicInfoSection({
    editMode,
    displayname,
    linkedinUrl,
    instagramUrl,
    XUrl,
    githubUrl,
    setDisplayname,
    setLinkedinUrl,
    setInstagramUrl,
    setXUrl,
    setGithubUrl,
}: Props) {
    const fields = [
        { label: "Display Name", value: displayname, setter: setDisplayname },
        { label: "LinkedIn", value: linkedinUrl, setter: setLinkedinUrl },
        { label: "Instagram", value: instagramUrl, setter: setInstagramUrl },
        { label: "X (Twitter)", value: XUrl, setter: setXUrl },
        { label: "GitHub", value: githubUrl, setter: setGithubUrl },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center">
                    <span className="text-white text-lg">🧾</span>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-white">Basic Information</h3>
                    <p className="text-sm text-gray-400">
                        Update your personal details used for display and verification
                    </p>
                </div>
            </div>

            {/* Fields */}
            <div className="space-y-4">
                {fields.map(({ label, value, setter }) => (
                    <div key={label} className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300">{label}</label>
                        {editMode ? (
                            <input
                                placeholder={label + " username"}
                                value={value}
                                onChange={(e) => setter(e.target.value)}
                                className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all duration-200"
                            />
                        ) : (
                            <div className="bg-gray-800/30 rounded-xl px-4 py-3 border border-gray-700/30">
                                <p className="text-gray-200">{value || "Not provided"}</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>

    );
}
