"use client";
interface Props {
    editMode: boolean;
    username: string;
    displayname: string;
    linkedinUrl: string;
    instagramUrl: string;
    XUrl: string;
    githubUrl: string;
    setUsername: (v: string) => void;
    setDisplayname: (v: string) => void;
    setLinkedinUrl: (v: string) => void;
    setInstagramUrl: (v: string) => void;
    setXUrl: (v: string) => void;
    setGithubUrl: (v: string) => void;
}

export default function BasicInfoSection({
    editMode,
    username,
    displayname,
    linkedinUrl,
    instagramUrl,
    XUrl,
    githubUrl,
    setUsername,
    setDisplayname,
    setLinkedinUrl,
    setInstagramUrl,
    setXUrl,
    setGithubUrl,
}: Props) {
    const fields = [
        { label: "Username", value: username, setter: setUsername },
        { label: "Display Name", value: displayname, setter: setDisplayname },
        { label: "LinkedIn", value: linkedinUrl, setter: setLinkedinUrl },
        { label: "Instagram", value: instagramUrl, setter: setInstagramUrl },
        { label: "X (Twitter)", value: XUrl, setter: setXUrl },
        { label: "GitHub", value: githubUrl, setter: setGithubUrl },
    ];

    return (
        <>
            {fields.map(({ label, value, setter }) => (
                <div key={label} className="my-4">
                    <label className="block text-sm">{label}</label>
                    {editMode ? (
                        <input
                            value={value}
                            onChange={(e) => setter(e.target.value)}
                            className="w-full border border-gray-300 p-1 rounded"
                        />
                    ) : (
                        <p>{value}</p>
                    )}
                </div>
            ))}
        </>
    );
}
