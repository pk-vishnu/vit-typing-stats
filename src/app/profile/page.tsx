"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import BasicInfoSection from "../components/profile/BasicInfoSection";
import CollegeEmailSection from "../components/profile/CollegeEmailSection";
import MonkeytypeSection from "../components/profile/MonkeytypeSection";
import toast, { Toaster } from 'react-hot-toast';
import { signOut } from "next-auth/react";

export default function Profile() {
    const { data: session, status, update } = useSession();

    const [editMode, setEditMode] = useState(false);
    const [refreshingAvatar, setRefreshingAvatar] = useState(false);
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
            const toastId = toast.loading("Loading profile...");
            try {
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

                    toast.success("Profile loaded!", { id: toastId });
                } else {
                    toast.error("Failed to load profile.", { id: toastId });
                }
            } catch (error) {
                console.error(error);
                toast.error("Something went wrong.", { id: toastId });
            }
        };
        if (session) fetchUserData();
    }, [session]);

    if (status === "loading") return <p>Loading...</p>;
    if (!session) return <p>You&apos;re not signed in.</p>;

    const handleRefreshAvatar = async () => {
        if (refreshingAvatar) return;
        setRefreshingAvatar(true);
        const toastId = toast.loading("Syncing with Discord...");

        try {
            const res = await fetch("/api/user/refresh-avatar", {
                method: "POST",
            });

            if (!res.ok) throw new Error("Failed to fetch from Discord");

            const data = await res.json();

            await update({
                ...session,
                user: {
                    ...session?.user,
                    image: data.url,
                },
            });

            toast.success("Avatar updated!", { id: toastId });
        } catch (error) {
            console.error(error);
            toast.error("Failed to sync avatar", { id: toastId });
        } finally {
            setRefreshingAvatar(false);
        }
    };

    const handleSave = async () => {
        const res = await fetch("/api/user", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
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
            toast.success("Changes saved successfully.");
        } else {
            toast.error("Failed to save changes.");
        }
    };

    const handleVerifyEmail = async () => {
        if (!email.endsWith("@vitstudent.ac.in")) {
            toast.error("Please use your VIT student email.");
            return;
        }
        const res = await fetch("/api/verify-email", {
            method: "POST",
            body: JSON.stringify({ email }),
        });

        if (res.ok) {
            toast.success("Verification code sent to your email.");
        } else {
            toast.error("Failed to send verification code.");
        }
    };

    const handleConfirmCode = async () => {
        const res = await fetch("/api/verify-email/confirm", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, code: verificationCode }),
        });

        if (res.ok) {
            toast.success("VIT Email verified");
            setCollegeVerified(true);
        } else {
            toast.error("Failed to verify email.");
        }
    };

    const handleVerifyMt = async () => {
        const toastId = toast.loading("Verifying profile...");
        try {
            const res = await fetch("/api/verify-monkeytype", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: mtUrl }),
            });

            toast.dismiss(toastId);

            if (res.ok) {
                toast.success("Monkeytype profile verified");
                setMTverified(true);
            } else {
                toast.error("Failed to verify Monkeytype profile.");
            }
        } catch (err) {
            console.log(err);
            toast.dismiss(toastId);
            toast.error("Something went wrong.");
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
            return;
        }
        const res = await fetch("/api/user", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
        });

        if (res.ok) {
            alert("Account deleted successfully.");
            window.location.href = "/";
            signOut();
        } else {
            alert("Failed to delete account.");
        }
    }

    return (
        <>
            <Navbar />
            <Toaster />
            <div className="min-h-screen bg-neutral-950">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Avatar, Discord ID & Actions */}
                        <div className="lg:col-span-1">
                            <div className="bg-black rounded-xl border border-neutral-900 p-6" style={{ boxShadow: 'inset 0 1px 3px 0 rgba(0, 0, 0, 0.5)' }}>

                                {/* Avatar Section */}
                                <div className="text-center mb-8">
                                    <div className="relative inline-block mb-4">
                                        <img
                                            src={session.user.image}
                                            alt="avatar"
                                            className="w-28 h-28 rounded-full mx-auto object-cover"
                                        />
                                        <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-500 rounded-full border-4 border-black flex items-center justify-center">
                                            <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                                        </div>
                                    </div>

                                    {/* sync avatar button */}
                                    <div className="flex justify-center">
                                        <button
                                            onClick={handleRefreshAvatar}
                                            disabled={refreshingAvatar}
                                            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 text-xs font-medium hover:text-white hover:border-neutral-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="12"
                                                height="12"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                className={refreshingAvatar ? "animate-spin" : ""}
                                            >
                                                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                                                <path d="M3 3v5h5" />
                                            </svg>
                                            {refreshingAvatar ? "Syncing..." : "Sync Avatar"}
                                        </button>
                                    </div>
                                </div>

                                {/* Discord ID */}
                                <div className="space-y-4 mb-8">
                                    <div>
                                        <label className="block text-xs text-neutral-500 uppercase tracking-wider font-semibold mb-2">
                                            Discord ID
                                        </label>
                                        <div className="bg-neutral-900 rounded-lg p-3 border border-neutral-800">
                                            <p className="text-sm font-mono text-neutral-300 break-all text-center">
                                                {session.user.id}
                                            </p>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-neutral-500 uppercase tracking-wider font-semibold mb-2">
                                            Discord Username
                                        </label>
                                        <div className="bg-neutral-900 rounded-lg p-3 border border-neutral-800">
                                            <p className="text-sm font-mono text-neutral-300 break-all text-center">
                                                {username}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="space-y-3">
                                    {editMode ? (
                                        <>
                                            <button
                                                onClick={handleSave}
                                                className="w-full px-4 py-3 bg-white text-neutral-950 font-semibold rounded-lg hover:bg-neutral-100 transition-colors"
                                            >
                                                Save Changes
                                            </button>
                                            <button
                                                onClick={() => setEditMode(false)}
                                                className="w-full px-4 py-3 bg-neutral-900 text-neutral-300 font-medium rounded-lg hover:bg-neutral-800 transition-colors border border-neutral-800"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleDelete}
                                                className="w-full px-4 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
                                            >
                                                Delete Account
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => setEditMode(true)}
                                            className="w-full px-4 py-3 bg-white text-neutral-950 font-semibold rounded-lg hover:bg-neutral-100 transition-colors"
                                        >
                                            Edit Profile
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Profile Sections */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                <div className="bg-black rounded-xl border border-neutral-900 p-6" style={{ boxShadow: 'inset 0 1px 3px 0 rgba(0, 0, 0, 0.5)' }}>
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
                                </div>

                                <div className="bg-black rounded-xl border border-neutral-900 p-6" style={{ boxShadow: 'inset 0 1px 3px 0 rgba(0, 0, 0, 0.5)' }}>
                                    <MonkeytypeSection
                                        editMode={editMode}
                                        mtUrl={mtUrl}
                                        setMtUrl={setMtUrl}
                                        handleVerifyMt={handleVerifyMt}
                                        mtVerified={mtVerified}
                                    />
                                </div>
                            </div>
                            <div className="bg-black rounded-xl border border-neutral-900 p-6" style={{ boxShadow: 'inset 0 1px 3px 0 rgba(0, 0, 0, 0.5)' }}>
                                <BasicInfoSection
                                    editMode={editMode}
                                    displayname={displayname}
                                    linkedinUrl={linkedinUrl}
                                    instagramUrl={instagramUrl}
                                    XUrl={XUrl}
                                    githubUrl={githubUrl}
                                    setDisplayname={setDisplayname}
                                    setLinkedinUrl={setLinkedinUrl}
                                    setInstagramUrl={setInstagramUrl}
                                    setXUrl={setXUrl}
                                    setGithubUrl={setGithubUrl}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons - Mobile Only */}
                    <div className="mt-8 lg:hidden flex flex-col gap-3">
                        {editMode ? (
                            <>
                                <button onClick={handleSave} className="px-8 py-3 bg-white text-neutral-950 font-semibold rounded-lg hover:bg-neutral-100 transition-colors">Save Changes</button>
                                <button onClick={() => setEditMode(false)} className="px-8 py-3 bg-neutral-900 text-neutral-300 font-medium rounded-lg hover:bg-neutral-800 transition-colors border border-neutral-800">Cancel</button>
                                <button onClick={handleDelete} className="px-8 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors">Delete Account</button>
                            </>
                        ) : (
                            <button onClick={() => setEditMode(true)} className="px-10 py-3 bg-white text-neutral-950 font-semibold rounded-lg hover:bg-neutral-100 transition-colors">Edit Profile</button>
                        )}
                    </div>

                    <div className="h-8"></div>
                </div>
            </div>
        </>
    );
}