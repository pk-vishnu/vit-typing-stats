"use client";
import { useSession } from "next-auth/react";
import LogoutButton from "./LogoutButton";
import LoginButton from "./LoginButton";
function Navbar() {
    const { data: session, status } = useSession();

    return (
        <>
            <nav className="shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <h1 className="text-m font-semibold text-gray-300">VIT Typing Stats</h1>
                        <ul className="flex space-x-6 items-center text-gray-300">

                            <li><a href="/leaderboard" className="hover:text-blue-600">Leaderboard</a></li>
                            {status === "authenticated" ? (
                                <>
                                    <li><a href="/profile" className="hover:text-blue-600">Profile</a></li>
                                    <li className="text-sm">Signed in as {session?.user.name}</li>
                                    <li><LogoutButton /></li>
                                </>
                            ) : (
                                <li><LoginButton /></li>
                            )}
                        </ul>
                    </div>
                </div>
            </nav>

        </>
    )
}

export default Navbar;