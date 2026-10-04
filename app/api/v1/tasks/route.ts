import { NextRequest, NextResponse } from "next/server";
import { prisma, dbUrl } from "@/lib/db";
import { requireAppUser, toHttpError, isAuthConfigured } from "@/lib/auth";

import { validate, taskCreateSchema, pagination } from "@/lib/validation";

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
    const params = req.nextUrl.searchParams;
    const { take, skip } = pagination(params);
    const where: Record<string, unknown> = { userId: user.id };
    const status = params.get("status");
    const priority = params.get("priority");
    if (status) where.status = status;
    if (priority) where.priority = priority;
    const [items, total] = await Promise.all([
      prisma.task.findMany({ where, orderBy: [{ createdAt: "desc" }], take, skip }),
      prisma.task.count({ where }),
    ]);
    return NextResponse.json({ items, total, take, skip });
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
    const body = validate(taskCreateSchema, await req.json());
    const item = await prisma.task.create({
      data: {
        userId: user.id,
        title: body.title,
        detail: body.detail,
        timeLabel: body.timeLabel,
        priority: body.priority,
        status: body.status,
        dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
        durationMin: body.durationMin,
        category: body.category,
      },
    });
    return NextResponse.json({ item }, { status: 201 });
  } catch (err) {
    const { status, body } = toHttpError(err);
    return NextResponse.json(body, { status });
  }
}
