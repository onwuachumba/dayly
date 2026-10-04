import { PrismaClient } from "@prisma/client";
import { getConnectionString } from "@netlify/database";

/**
 * Resolve the Postgres URL for the current environment (verified against
 * `@netlify/database` v2: `getConnectionString()` returns the right
 * connection for local dev, deploy previews, and production, and throws
 * `MissingDatabaseConnectionError` when no database is configured).
 * Falls back to `DATABASE_URL` for plain local runs outside `netlify dev`.
 */
export function dbUrl(): string | undefined {
  try {
    return getConnectionString();
  } catch {
    return process.env.DATABASE_URL;
  }
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const url = dbUrl();

type PrismaOptions = ConstructorParameters<typeof PrismaClient>[0];
const options: PrismaOptions = url ? { datasourceUrl: url } : undefined;

export const prisma = globalForPrisma.prisma ?? new PrismaClient(options);

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
