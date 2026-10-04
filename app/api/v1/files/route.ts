import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getStore } from "@netlify/blobs";
import { prisma, dbUrl } from "@/lib/db";
import { requireAppUser, toHttpError, isAuthConfigured } from "@/lib/auth";


const ALLOWED = new Set(["image/png", "image/jpeg", "application/pdf"]);
const EXT_BY_MIME: Record<string, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "application/pdf": ".pdf",
};
const MAX_BYTES = 5 * 1024 * 1024;

function unavailable() {
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
  return null;
}

function blobStore() {
  // On Netlify this resolves from the runtime; locally it needs a site ID + token.
  if (process.env.NETLIFY_SITE_ID && process.env.NETLIFY_BLOBS_TOKEN) {
    return getStore({
      name: "dayly-uploads",
      siteID: process.env.NETLIFY_SITE_ID,
      token: process.env.NETLIFY_BLOBS_TOKEN,
    });
  }
  return getStore("dayly-uploads");
}

export async function GET() {
  const blocked = unavailable();
  if (blocked) return blocked;
  try {
    const user = await requireAppUser();
    const items = await prisma.file.findMany({
      where: { userId: user.id },
      orderBy: [{ createdAt: "desc" }],
      take: 50,
    });
    return NextResponse.json({ items });
  } catch (err) {
    const { status, body } = toHttpError(err);
    return NextResponse.json(body, { status });
  }
}

export async function POST(req: NextRequest) {
  const blocked = unavailable();
  if (blocked) return blocked;
  try {
    const user = await requireAppUser();
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Attach a file as 'file'" } },
        { status: 400 },
      );
    }
    if (!ALLOWED.has(file.type) || file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Only png, jpg, and pdf files up to 5 MB are allowed" } },
        { status: 400 },
      );
    }
    const taskIdRaw = form.get("taskId");
    let taskId: string | undefined;
    if (typeof taskIdRaw === "string" && taskIdRaw) {
      const task = await prisma.task.findFirst({ where: { id: taskIdRaw, userId: user.id } });
      if (!task) {
        return NextResponse.json(
          { error: { code: "FORBIDDEN", message: "Task does not belong to you" } },
          { status: 403 },
        );
      }
      taskId = task.id;
    }
    const key = `${user.id}/${crypto.randomUUID()}${EXT_BY_MIME[file.type] ?? ""}`;
    let store;
    try {
      store = blobStore();
    } catch {
      return NextResponse.json(
        {
          error: {
            code: "BLOBS_NOT_CONFIGURED",
            message: "Netlify Blobs is not configured locally — set NETLIFY_SITE_ID + NETLIFY_BLOBS_TOKEN or deploy to Netlify",
          },
        },
        { status: 503 },
      );
    }
    await store.set(key, await file.arrayBuffer(), { metadata: { contentType: file.type } });
    const item = await prisma.file.create({
      data: {
        userId: user.id,
        taskId,
        originalName: file.name,
        blobKey: key,
        mime: file.type,
        size: file.size,
      },
    });
    return NextResponse.json({ item }, { status: 201 });
  } catch (err) {
    const { status, body } = toHttpError(err);
    return NextResponse.json(body, { status });
  }
}
