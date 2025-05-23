"use client";
import { signIn } from "next-auth/react";

function LoginButton() {
    return (
        <button onClick={() => signIn("discord")}>Sign in with Discord</button>
    );
}

export default LoginButton;