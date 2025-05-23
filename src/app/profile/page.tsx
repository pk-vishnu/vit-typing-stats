"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import BasicInfoSection from "../components/profile/BasicInfoSection";
import CollegeEmailSection from "../components/profile/CollegeEmailSection";
import MonkeytypeSection from "../components/profile/MonkeytypeSection";

export default function Profile() {
    const { data: session, status } = useSession();
    const [editMode, setEditMode] = useState(false);

    const [username, setUsername] = useState("");
    const [displayname, setDisplayname] = useState("");
    const [email, setEmail] = useState("");
    const [collegeVerified, setCollegeVerified] = useState(false);
    const [mtUrl, setMtUrl] = useState("");
    const [linkedinUrl, setLinkedinUrl] = useState("");
    const [instagramUrl, setInstagramUrl] = useState("");
    const [XUrl, setXUrl] = useState("");
    const [githubUrl, setGithubUrl] = useState("");
    const [verificationCode, setVerificationCode] = useState("");
    const [mtVerified, setMTverified] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            const res = await fetch("/api/user");
            if (res.ok) {
                const data = await res.json();
                setUsername(data.username || "");
                setDisplayname(data.displayname || "");
                setEmail(data.collegeEmail || "");
                setCollegeVerified(data.collegeVerified === true);
                setMtUrl(data.mtUrl || "");
                setLinkedinUrl(data.linkedinUrl || "");
                setInstagramUrl(data.instagramUrl || "");
                setXUrl(data.XUrl || "");
                setGithubUrl(data.githubUrl || "");
                setMTverified(data.mtVerified === true);
            }
        };
        fetchUserData();
    }, [session]);

    if (status === "loading") return <p>Loading...</p>;
    if (!session) return <p>You're not signed in.</p>;

    const handleSave = async () => {
        const res = await fetch("/api/user", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username,
                displayname,
                collegeEmail: email,
                mtUrl,
                linkedinUrl,
                instagramUrl,
                XUrl,
                githubUrl,
            }),
        });

        if (res.ok) {
            setEditMode(false);
        }
    };

    const handleVerifyEmail = async () => {
        if (!email.endsWith("@vitstudent.ac.in")) {
            alert("Please use your VIT student email.");
            return;
        }
        const res = await fetch("/api/verify-email", {
            method: "POST",
            body: JSON.stringify({ email }),
        });

        if (res.ok) {
            alert("Verification code sent! Check your inbox.");
        } else {
            alert("Failed to send verification email.");
        }
    };

    const handleConfirmCode = async () => {
        const res = await fetch("/api/verify-email/confirm", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, code: verificationCode }),
        });

        if (res.ok) {
            alert("Email verified!");
            setCollegeVerified(true);
        } else {
            alert("Invalid or expired verification code.");
        }
    };

    const handleVerifyMt = async () => {
        const res = await fetch("/api/verify-monkeytype", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: mtUrl }),
        });
        if (res.ok) {
            alert("Monkeytype profile verified!");
            setMTverified(true);
        } else {
            alert("Failed to verify Monkeytype profile.");
        }
    }
    return (
        <>
            <Navbar />
            <div className="p-4 max-w-xl mx-auto">
                <h2 className="text-2xl font-semibold mb-4">Profile</h2>

                <img
                    src={session.user.image}
                    alt="avatar"
                    className="w-16 h-16 rounded-full"
                />

                <div className="my-4">
                    <label className="block text-sm text-gray-500">Discord ID</label>
                    <p className="text-sm font-mono p-1 rounded">
                        {session.user.id}
                    </p>
                </div>

                {/* Basic Info Section */}
                <BasicInfoSection
                    editMode={editMode}
                    username={username}
                    displayname={displayname}
                    linkedinUrl={linkedinUrl}
                    instagramUrl={instagramUrl}
                    XUrl={XUrl}
                    githubUrl={githubUrl}
                    setUsername={setUsername}
                    setDisplayname={setDisplayname}
                    setLinkedinUrl={setLinkedinUrl}
                    setInstagramUrl={setInstagramUrl}
                    setXUrl={setXUrl}
                    setGithubUrl={setGithubUrl}
                />

                {/* College Email Section */}
                <CollegeEmailSection
                    editMode={editMode}
                    email={email}
                    setEmail={setEmail}
                    collegeVerified={collegeVerified}
                    handleVerifyEmail={handleVerifyEmail}
                    verificationCode={verificationCode}
                    setVerificationCode={setVerificationCode}
                    handleConfirmCode={handleConfirmCode}
                />

                {/* Monkeytype Section */}
                <MonkeytypeSection
                    editMode={editMode}
                    mtUrl={mtUrl}
                    setMtUrl={setMtUrl}
                    handleVerifyMt={handleVerifyMt}
                    mtVerified={mtVerified}
                />

                {/* Action Buttons */}
                <div className="mt-4">
                    {editMode ? (
                        <>
                            <button onClick={handleSave} className="btn mr-2">
                                Save
                            </button>
                            <button
                                onClick={() => setEditMode(false)}
                                className="btn-secondary"
                            >
                                Cancel
                            </button>
                        </>
                    ) : (
                        <button onClick={() => setEditMode(true)} className="btn">
                            Edit Profile
                        </button>
                    )}
                </div>
            </div>
        </>
    );
}
