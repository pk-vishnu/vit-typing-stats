"use client";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState, useRef } from "react";
import { signOut } from "next-auth/react";
import LoginButton from "./LoginButton";
import toast, { Toaster } from "react-hot-toast";
import Image from "next/image";

function Navbar() {
    const { data: session, status } = useSession();
    const [rank, setRank] = useState<number | null>(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchRank = async () => {
            const res = await fetch("/api/rank");
            if (res.ok) {
                const data = await res.json();
                setRank(data.rank);
            }
        };
        fetchRank();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                event.target instanceof Node &&
                !dropdownRef.current.contains(event.target)
            ) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleComingSoon = () => {
        return toast("Coming Soon!");
    };

    return (
        <>
            <Toaster />
            <nav className="bg-black border-b border-gray-800">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo / Title */}
                        <Link href="/">
                            <p className="text-lg font-semibold text-white hover:text-gray-400 transition">
                                VIT Typing Stats
                            </p>
                        </Link>

                        {/* Desktop Menu */}
                        <div className="hidden md:flex items-center space-x-6 text-gray-300">
                            <Link href="/">
                                <p onClick={handleComingSoon} className="hover:text-gray-400 transition">
                                    Events
                                </p>
                            </Link>
                            <Link href="/">
                                <p onClick={handleComingSoon} className="hover:text-gray-400 transition">
                                    Guilds
                                </p>
                            </Link>
                            <Link href="/leaderboard">
                                <p className="hover:text-gray-400 transition">Leaderboards</p>
                            </Link>

                            {status === "authenticated" ? (
                                <>
                                    {rank !== null && (
                                        <span className="text-sm text-yellow-400 hidden sm:inline">🏆 #{rank}</span>
                                    )}
                                    {/* Avatar & Dropdown */}
                                    <div className="relative" ref={dropdownRef}>
                                        <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-2 focus:outline-none">
                                            <img
                                                src={session.user?.image || "/default-avatar.png"}
                                                alt="User avatar"
                                                className="w-8 h-8 rounded-full border border-gray-700"
                                            />
                                        </button>
                                        {dropdownOpen && (
                                            <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-50">
                                                <Link href="/profile">
                                                    <p className="block px-4 py-2 text-gray-300 hover:bg-gray-700 rounded-t-md transition">
                                                        Profile
                                                    </p>
                                                </Link>
                                                <button
                                                    onClick={() => signOut({ callbackUrl: "/" })}
                                                    className="w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-700 rounded-b-md transition"
                                                >
                                                    Logout
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <LoginButton />
                            )}
                        </div>

                        {/* Mobile Hamburger */}
                        <div className="md:hidden">
                            <button onClick={() => setDropdownOpen(!dropdownOpen)} className="text-gray-300 hover:text-white focus:outline-none">
                                ☰
                            </button>
                        </div>
                    </div>

                    {/* Mobile Dropdown Menu */}
                    {dropdownOpen && (
                        <div className="md:hidden mt-2 space-y-1 text-gray-300">
                            <Link href="/">
                                <p onClick={handleComingSoon} className="block px-4 py-2 hover:bg-gray-800 rounded transition">
                                    Events
                                </p>
                            </Link>
                            <Link href="/">
                                <p onClick={handleComingSoon} className="block px-4 py-2 hover:bg-gray-800 rounded transition">
                                    Guilds
                                </p>
                            </Link>
                            <Link href="/leaderboard">
                                <p className="block px-4 py-2 hover:bg-gray-800 rounded transition">Leaderboards</p>
                            </Link>

                            {status === "authenticated" ? (
                                <>
                                    <Link href="/profile">
                                        <p className="block px-4 py-2 hover:bg-gray-800 rounded transition">Profile</p>
                                    </Link>
                                    <button
                                        onClick={() => signOut({ callbackUrl: "/" })}
                                        className="w-full text-left px-4 py-2 hover:bg-gray-800 rounded transition"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <div className="px-4 py-2"><LoginButton /></div>
                            )}
                        </div>
                    )}
                </div>
            </nav>
        </>
    );
}

export default Navbar;
