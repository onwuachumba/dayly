import { NextRequest, NextResponse } from "next/server";
import { prisma, dbUrl } from "@/lib/db";
import { requireAppUser, toHttpError, isAuthConfigured } from "@/lib/auth";

import { validate, reminderCreateSchema } from "@/lib/validation";

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

export async function GET(req: NextRequest) {
  const blocked = unavailable();
  if (blocked) return blocked;
  try {
    const user = await requireAppUser();
    const upcoming = req.nextUrl.searchParams.get("upcoming") === "1";
    const where: Record<string, unknown> = { userId: user.id };
    if (upcoming) {
      where.remindAt = { gte: new Date() };
      where.sent = false;
    }
    const items = await prisma.reminder.findMany({
      where,
      orderBy: [{ remindAt: "asc" }],
      take: 50,
      include: { task: true },
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
    const body = validate(reminderCreateSchema, await req.json());
    if (body.taskId) {
      const task = await prisma.task.findFirst({ where: { id: body.taskId, userId: user.id } });
      if (!task) {
        return NextResponse.json(
          { error: { code: "FORBIDDEN", message: "Task does not belong to you" } },
          { status: 403 },
        );
      }
    }
    const item = await prisma.reminder.create({
      data: { userId: user.id, taskId: body.taskId, remindAt: new Date(body.remindAt) },
    });
    return NextResponse.json({ item }, { status: 201 });
  } catch (err) {
    const { status, body } = toHttpError(err);
    return NextResponse.json(body, { status });
  }
}
