"use client";
import { signOut } from "next-auth/react";

function LogoutButton() {
    return (
        <button onClick={() => signOut({ callbackUrl: "/" })}>
            Sign out
        </button>
    );
}
export default LogoutButton;