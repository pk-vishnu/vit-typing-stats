"use client";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState, useRef } from "react";
import { signOut } from "next-auth/react";
import LoginButton from "./LoginButton";
import toast, { Toaster } from "react-hot-toast";

function Navbar() {
    const { data: session, status } = useSession();
    const [rank, setRank] = useState<number | null>(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const mobileMenuRef = useRef<HTMLDivElement>(null);

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
            if (
                mobileMenuRef.current &&
                event.target instanceof Node &&
                !mobileMenuRef.current.contains(event.target)
            ) {
                setMobileMenuOpen(false);
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

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setMobileMenuOpen(false);
    };

    return (
        <>
            <Toaster />
            <nav className="bg-black border-b border-neutral-900">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo / Title */}
                        <Link href="/">
                            <p className="text-lg font-bold text-white hover:text-neutral-300 transition-colors">
                                VIT Typing Stats
                            </p>
                        </Link>

                        {/* Desktop Menu */}
                        <div className="hidden md:flex items-center space-x-8 text-neutral-400">
                            <Link href="/">
                                <p onClick={handleComingSoon} className="text-sm font-medium hover:text-white transition-colors">
                                    Events
                                </p>
                            </Link>
                            <Link href="/">
                                <p onClick={handleComingSoon} className="text-sm font-medium hover:text-white transition-colors">
                                    Guilds
                                </p>
                            </Link>
                            <Link href="/leaderboard">
                                <p className="text-sm font-medium hover:text-white transition-colors">Leaderboards</p>
                            </Link>

                            {status === "authenticated" ? (
                                <>
                                    {rank !== null && rank <= 3 ? (
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 rounded-lg border border-neutral-800">
                                            <span className={`text-sm font-bold ${rank === 1 ? "text-amber-400" :
                                                    rank === 2 ? "text-slate-300" :
                                                        "text-amber-600"
                                                }`}>
                                                #{rank}
                                            </span>
                                        </div>
                                    ) : rank !== null ? (
                                        <span className="text-sm font-semibold text-neutral-400">#{rank}</span>
                                    ) : null}

                                    {/* Avatar & Dropdown */}
                                    <div className="relative" ref={dropdownRef}>
                                        <button
                                            onClick={() => setDropdownOpen(!dropdownOpen)}
                                            className="flex items-center gap-2 focus:outline-none hover:opacity-80 transition-opacity"
                                        >
                                            <img
                                                src={session.user?.image || "/default-avatar.png"}
                                                alt="User avatar"
                                                className="w-9 h-9 rounded-full"
                                            />
                                        </button>
                                        <div className={`absolute right-0 mt-3 w-44 bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden shadow-lg z-50 transition-all duration-150 ease-out origin-top-right ${dropdownOpen
                                                ? 'opacity-100 scale-100'
                                                : 'opacity-0 scale-95 pointer-events-none'
                                            }`}>
                                            <Link href="/profile">
                                                <p className="block px-4 py-3 text-sm text-neutral-300 hover:bg-neutral-800 transition-colors">
                                                    Profile
                                                </p>
                                            </Link>
                                            <button
                                                onClick={() => signOut({ callbackUrl: "/" })}
                                                className="w-full text-left px-4 py-3 text-sm text-neutral-300 hover:bg-neutral-800 transition-colors"
                                            >
                                                Logout
                                            </button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <LoginButton />
                            )}
                        </div>

                        {/* Mobile Hamburger */}
                        <div className="md:hidden" ref={mobileMenuRef}>
                            <button
                                onClick={toggleMobileMenu}
                                className="text-neutral-400 hover:text-white focus:outline-none transition-colors"
                                aria-label="Toggle mobile menu"
                            >
                                <div className="space-y-1.5">
                                    <div className={`w-6 h-0.5 bg-current transform transition-all duration-200 ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''
                                        }`}></div>
                                    <div className={`w-6 h-0.5 bg-current transition-all duration-200 ${mobileMenuOpen ? 'opacity-0' : 'opacity-100'
                                        }`}></div>
                                    <div className={`w-6 h-0.5 bg-current transform transition-all duration-200 ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''
                                        }`}></div>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Mobile Dropdown Menu */}
                    <div className={`md:hidden overflow-hidden transition-all duration-200 ${mobileMenuOpen ? 'max-h-96 opacity-100 pb-4' : 'max-h-0 opacity-0'
                        }`}>
                        <div className="pt-2 space-y-1 text-neutral-400">
                            <Link href="/" onClick={closeMobileMenu}>
                                <p onClick={handleComingSoon} className="block px-4 py-3 text-sm hover:bg-neutral-900 rounded-lg transition-colors">
                                    Events
                                </p>
                            </Link>
                            <Link href="/" onClick={closeMobileMenu}>
                                <p onClick={handleComingSoon} className="block px-4 py-3 text-sm hover:bg-neutral-900 rounded-lg transition-colors">
                                    Guilds
                                </p>
                            </Link>
                            <Link href="/leaderboard" onClick={closeMobileMenu}>
                                <p className="block px-4 py-3 text-sm hover:bg-neutral-900 rounded-lg transition-colors">
                                    Leaderboards
                                </p>
                            </Link>

                            {status === "authenticated" ? (
                                <>
                                    {rank !== null && (
                                        <div className="px-4 py-2">
                                            <span className={`text-sm font-bold ${rank <= 3 ? (
                                                    rank === 1 ? "text-amber-400" :
                                                        rank === 2 ? "text-slate-300" :
                                                            "text-amber-600"
                                                ) : "text-neutral-400"
                                                }`}>
                                                Rank #{rank}
                                            </span>
                                        </div>
                                    )}
                                    <Link href="/profile" onClick={closeMobileMenu}>
                                        <p className="block px-4 py-3 text-sm hover:bg-neutral-900 rounded-lg transition-colors">
                                            Profile
                                        </p>
                                    </Link>
                                    <button
                                        onClick={() => {
                                            closeMobileMenu();
                                            signOut({ callbackUrl: "/" });
                                        }}
                                        className="w-full text-left px-4 py-3 text-sm hover:bg-neutral-900 rounded-lg transition-colors"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <div className="px-4 py-3">
                                    <LoginButton />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>
        </>
    );
}

export default Navbar;