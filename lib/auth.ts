import { headers } from "next/headers";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/db";

// Better Auth owns identity (email + password). DAYLY rows are keyed by the
// Better Auth user id. Construction needs a secret, so the instance is null
// until configured and the app boots in setup mode instead of crashing.
export function isAuthConfigured(): boolean {
  return Boolean(process.env.BETTER_AUTH_SECRET);
}

function createAuth() {
  if (!isAuthConfigured()) return null;
  return betterAuth({
    database: prismaAdapter(prisma, { provider: "postgresql" }),
    emailAndPassword: { enabled: true },
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL,
  });
}

export const auth = createAuth();

export type DbUser = {
  id: string;
  email: string;
  name: string | null;
};

/** Resolve the Better Auth session to the DAYLY user row. */
export async function requireAppUser(): Promise<DbUser> {
  if (!auth) {
    const err = new Error("Authentication is not configured — see .env.example") as Error & {
      status: number;
      code: string;
    };
    err.status = 503;
    err.code = "AUTH_NOT_CONFIGURED";
    throw err;
  }
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    const err = new Error("Not authenticated") as Error & { status: number; code: string };
    err.status = 401;
    err.code = "UNAUTHORIZED";
    throw err;
  }
  const row = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!row) {
    const err = new Error("Account record not found") as Error & { status: number; code: string };
    err.status = 404;
    err.code = "NOT_FOUND";
    throw err;
  }
  return { id: row.id, email: row.email, name: row.name };
}

export function toHttpError(err: unknown): { status: number; body: object } {
  const e = err as { status?: number; code?: string; message?: string; details?: unknown };
  if (e.code === "AUTH_NOT_CONFIGURED" || e.code === "DB_NOT_CONFIGURED") {
    return { status: 503, body: { error: { code: e.code, message: e.message } } };
  }
  const status = e.status && Number.isInteger(e.status) ? e.status : 500;
  return {
    status,
    body: {
      error: {
        code: e.code || (status === 500 ? "INTERNAL_ERROR" : "REQUEST_ERROR"),
        message: status === 500 ? "Internal server error" : e.message || "Request failed",
        ...(e.details ? { details: e.details } : {}),
      },
    },
  };
}
