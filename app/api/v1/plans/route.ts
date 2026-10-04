import { NextRequest, NextResponse } from "next/server";
import { prisma, dbUrl } from "@/lib/db";
import { requireAppUser, toHttpError, isAuthConfigured } from "@/lib/auth";

import { validate, planCreateSchema } from "@/lib/validation";

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
    const date = req.nextUrl.searchParams.get("date");
    if (!date) {
      const items = await prisma.plan.findMany({
        where: { userId: user.id },
        orderBy: [{ date: "desc" }],
        take: 30,
        include: { items: { include: { task: true }, orderBy: { sortOrder: "asc" } } },
      });
      return NextResponse.json({ items });
    }
    const item = await prisma.plan.findUnique({
      where: { userId_date: { userId: user.id, date: new Date(date) } },
      include: { items: { include: { task: true }, orderBy: { sortOrder: "asc" } } },
    });
    return NextResponse.json({ item });
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
    const body = validate(planCreateSchema, await req.json());
    const date = new Date(body.date);
    const owned = await prisma.task.findMany({
      where: { id: { in: body.taskIds }, userId: user.id },
      select: { id: true },
    });
    if (owned.length !== body.taskIds.length) {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: "One or more tasks do not belong to you" } },
        { status: 403 },
      );
    }
    const plan = await prisma.plan.upsert({
      where: { userId_date: { userId: user.id, date } },
      create: { userId: user.id, date, summary: body.summary },
      update: { summary: body.summary },
    });
    await prisma.planItem.deleteMany({ where: { planId: plan.id } });
    if (body.taskIds.length) {
      await prisma.planItem.createMany({
        data: body.taskIds.map((taskId, i) => ({ planId: plan.id, taskId, sortOrder: i })),
      });
    }
    const item = await prisma.plan.findUnique({
      where: { id: plan.id },
      include: { items: { include: { task: true }, orderBy: { sortOrder: "asc" } } },
    });
    return NextResponse.json({ item }, { status: 201 });
  } catch (err) {
    const { status, body } = toHttpError(err);
    return NextResponse.json(body, { status });
  }
}
