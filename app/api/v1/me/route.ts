import { NextResponse } from "next/server";
import { dbUrl } from "@/lib/db";
import { requireAppUser, toHttpError, isAuthConfigured } from "@/lib/auth";


export async function GET() {
  try {
    if (!isAuthConfigured()) {
      return NextResponse.json(
        { error: { code: "AUTH_NOT_CONFIGURED", message: "Authentication is not configured — see .env.example" } },
        { status: 503 },
      );
    }
    if (!dbUrl()) {
      return NextResponse.json(
        { error: { code: "DB_NOT_CONFIGURED", message: "DATABASE_URL is missing — see .env.example" } },
        { status: 503 },
      );
    }
    const user = await requireAppUser();
    return NextResponse.json({ user });
  } catch (err) {
    const { status, body } = toHttpError(err);
    return NextResponse.json(body, { status });
  }
}
