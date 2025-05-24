"use client";
import { useSession } from "next-auth/react";
import { FaDiscord, FaTrophy } from "react-icons/fa";
import LogoutButton from "./LogoutButton";
import LoginButton from "./LoginButton";
import Link from "next/link";

function Navbar() {
    const { data: session, status } = useSession();

    return (
        <nav className="shadow-md bg-black border-b border-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16 text-gray-300">
                    <div className="flex-shrink-0">
                        <h1 className="text-lg font-black text-white tracking-wide">VIT Typing Stats</h1>
                    </div>
                    <div className="flex items-center space-x-8">
                        <Link 
                            href="/leaderboard" 
                            className="flex items-center hover:text-yellow-400 transition-colors duration-200 group"
                        >
                            <FaTrophy className="text-xl" />
                            <span className="ml-2 hidden sm:inline group-hover:drop-shadow-[0_0_8px_rgba(251,191,36,0.8)] transition-all duration-200">
                                Leaderboard
                            </span>
                        </Link>
                        
                        {status === "authenticated" ? (
                            <div className="flex items-center space-x-4">
                                <Link 
                                    href="/profile" 
                                    className="hidden sm:block hover:text-blue-400 transition-colors duration-200 hover:drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]"
                                >
                                    Profile
                                </Link>
                                <span className="hidden md:block text-sm text-gray-400">
                                    {session?.user.name}
                                </span>
                                <LogoutButton />
                            </div>
                        ) : (
                            <Link
                                href="/api/auth/signin/discord"
                                className="flex items-center bg-[#5865F2] text-white px-4 py-2 rounded-full hover:opacity-90 transition-all duration-200 group shadow-lg hover:shadow-xl"
                            >
                                <FaDiscord className="text-xl" />
                                <span className="ml-2 hidden sm:inline group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] transition-all duration-200">
                                    Login with Discord
                                </span>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;