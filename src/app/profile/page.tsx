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
    const [loading, setLoading] = useState(false);

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
        setLoading(true);

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
            toast.dismiss(toastId);
            toast.error("Something went wrong.");
        } finally {
            setLoading(false);
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
            <div className="min-h-screen bg-gradient-to-br from-gray-950 to-black">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                        {/* Left Column - Avatar, Discord ID & Actions */}
                        <div className="lg:col-span-1">
                            <div className="bg-gray-900/30 backdrop-blur-sm rounded-2xl border border-gray-800/50 p-6 shadow-2xl">
                                {/* Avatar Section */}
                                <div className="text-center mb-6">
                                    <div className="relative inline-block mb-4">
                                        <img
                                            src={session.user.image}
                                            alt="avatar"
                                            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full ring-4 ring-gray-700 shadow-2xl mx-auto"
                                        />
                                        <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-gradient-to-r from-green-500 to-emerald-400 rounded-full border-3 border-gray-900 flex items-center justify-center">
                                            <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                                        </div>
                                    </div>
                                </div>

                                {/* Discord ID */}
                                <div className="space-y-3 mb-6">
                                    <label className="block text-xs text-gray-400 uppercase tracking-wider font-semibold">
                                        Discord ID
                                    </label>
                                    <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/30">
                                        <p className="text-sm font-mono text-gray-200 break-all text-center">
                                            {session.user.id}
                                        </p>
                                    </div>
                                    <label className="block text-xs text-gray-400 uppercase tracking-wider font-semibold">
                                        Discord Username
                                    </label>
                                    <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/30">
                                        <p className="text-sm font-mono text-gray-200 break-all text-center">
                                            {session.user.name}
                                        </p>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="space-y-3">
                                    {editMode ? (
                                        <>
                                            <button
                                                onClick={handleSave}
                                                className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg shadow-blue-500/25"
                                            >
                                                Save Changes
                                            </button>
                                            <button
                                                onClick={() => setEditMode(false)}
                                                className="w-full px-4 py-3 bg-gray-700/50 text-gray-300 font-semibold rounded-xl hover:bg-gray-600/50 transform hover:scale-105 transition-all duration-200 border border-gray-600/50"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleDelete}
                                                className="w-full px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-xl hover:from-red-700 hover:to-red-800 transform hover:scale-105 transition-all duration-200 shadow-lg shadow-red-500/25"
                                            >
                                                Delete Account
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => setEditMode(true)}
                                            className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg shadow-blue-500/25"
                                        >
                                            Edit Profile
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Profile Sections */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* College Email & Monkeytype in a row on larger screens */}
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                {/* College Email Section */}
                                <div className="bg-gray-900/30 backdrop-blur-sm rounded-2xl border border-gray-800/50 p-6 shadow-2xl">
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

                                {/* Monkeytype Section */}
                                <div className="bg-gray-900/30 backdrop-blur-sm rounded-2xl border border-gray-800/50 p-6 shadow-2xl">
                                    <MonkeytypeSection
                                        editMode={editMode}
                                        mtUrl={mtUrl}
                                        setMtUrl={setMtUrl}
                                        handleVerifyMt={handleVerifyMt}
                                        mtVerified={mtVerified}
                                    />
                                </div>
                            </div>
                            {/* Basic Info Section */}
                            <div className="bg-gray-900/30 backdrop-blur-sm rounded-2xl border border-gray-800/50 p-6 shadow-2xl">
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
                                <button
                                    onClick={handleSave}
                                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg shadow-blue-500/25"
                                >
                                    Save Changes
                                </button>
                                <button
                                    onClick={() => setEditMode(false)}
                                    className="px-8 py-3 bg-gray-700/50 text-gray-300 font-semibold rounded-xl hover:bg-gray-600/50 transform hover:scale-105 transition-all duration-200 border border-gray-600/50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-xl hover:from-red-700 hover:to-red-800 transform hover:scale-105 transition-all duration-200 shadow-lg shadow-red-500/25"
                                >
                                    Delete Account
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => setEditMode(true)}
                                className="px-10 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg shadow-blue-500/25"
                            >
                                Edit Profile
                            </button>
                        )}
                    </div>

                    {/* Footer Space */}
                    <div className="h-8"></div>
                </div>
            </div>
        </>
    );
}
