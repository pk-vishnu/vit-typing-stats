import { NextResponse } from "next/server";
import { refreshScores } from "@/lib/refreshScores";

export async function POST() {
  try {
    const results = await refreshScores();
    return NextResponse.json({ message: "Scores updated", results });
  } catch (err) {
    console.error("Refresh failed", err);
    return NextResponse.json({ error: "Failed to refresh scores" }, { status: 500 });
  }
}
