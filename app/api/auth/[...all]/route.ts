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
  return toNextJsHandler(auth).GET(req);
}

export async function POST(req: NextRequest) {
  if (!auth) return notConfigured();
  return toNextJsHandler(auth).POST(req);
}
