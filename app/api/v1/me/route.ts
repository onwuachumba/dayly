import { NextRequest, NextResponse } from "next/server";
import { prisma, dbUrl } from "@/lib/db";
import { requireAppUser, toHttpError, isAuthConfigured } from "@/lib/auth";
import { validate, profileUpdateSchema } from "@/lib/validation";


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

export async function PATCH(req: NextRequest) {
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
    const body = validate(profileUpdateSchema, await req.json());
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(body.name !== undefined ? { name: body.name } : {}),
        ...(body.workStart !== undefined ? { workStart: body.workStart } : {}),
        ...(body.workEnd !== undefined ? { workEnd: body.workEnd } : {}),
        ...(body.notifyDaily !== undefined ? { notifyDaily: body.notifyDaily } : {}),
        ...(body.quietStart !== undefined ? { quietStart: body.quietStart } : {}),
        ...(body.quietEnd !== undefined ? { quietEnd: body.quietEnd } : {}),
      },
      select: {
        id: true,
        email: true,
        name: true,
        workStart: true,
        workEnd: true,
        notifyDaily: true,
        quietStart: true,
        quietEnd: true,
      },
    });
    return NextResponse.json({ user: updated });
  } catch (err) {
    const { status, body } = toHttpError(err);
    return NextResponse.json(body, { status });
  }
}
