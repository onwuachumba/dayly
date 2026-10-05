import { NextRequest, NextResponse } from "next/server";
import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";

function notConfigured() {
  return NextResponse.json(
    { error: { code: "AUTH_NOT_CONFIGURED", message: "Authentication is not configured — see .env.example" } },
    { status: 503 },
  );
}

export async function GET(req: NextRequest) {
  if (!auth) return notConfigured();
  try {
    return await toNextJsHandler(auth).GET(req);
  } catch (err) {
    console.error("auth GET failed", err);
    return NextResponse.json(
      { error: { code: "AUTH_ERROR", message: err instanceof Error ? err.message : "Authentication failed" } },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  if (!auth) return notConfigured();
  try {
    return await toNextJsHandler(auth).POST(req);
  } catch (err) {
    console.error("auth POST failed", err);
    return NextResponse.json(
      { error: { code: "AUTH_ERROR", message: err instanceof Error ? err.message : "Authentication failed" } },
      { status: 500 },
    );
  }
}
