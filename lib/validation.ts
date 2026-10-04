import { z } from "zod";

export function validate<S extends z.ZodTypeAny>(schema: S, data: unknown): z.output<S> {
  const result = schema.safeParse(data);
  if (!result.success) {
    const err = new Error("Validation failed") as Error & {
      status: number;
      code: string;
      details: unknown;
    };
    err.status = 400;
    err.code = "VALIDATION_ERROR";
    err.details = result.error.flatten();
    throw err;
  }
  return result.data;
}

export const taskCreateSchema = z.object({
  title: z.string().min(1).max(300),
  detail: z.string().max(2000).optional(),
  timeLabel: z.string().max(60).optional(),
  priority: z.enum(["HIGH", "MEDIUM", "LOW"]).default("MEDIUM"),
  status: z.enum(["PLANNED", "DONE", "MOVED"]).default("PLANNED"),
  dueDate: z.string().datetime().optional(),
  durationMin: z.number().int().min(1).max(1440).optional(),
  category: z.string().max(80).optional(),
});

export const taskUpdateSchema = taskCreateSchema.partial();

export const planCreateSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD"),
  summary: z.string().max(500).optional(),
  taskIds: z.array(z.string().uuid()).max(100).default([]),
});

export const goalCreateSchema = z.object({
  title: z.string().min(1).max(300),
  target: z.string().max(300).optional(),
  progress: z.number().int().min(0).max(100).default(0),
});

export const goalUpdateSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  target: z.string().max(300).optional().nullable(),
  progress: z.number().int().min(0).max(100).optional(),
  status: z.enum(["ACTIVE", "DONE", "ARCHIVED"]).optional(),
});

export const habitCreateSchema = z.object({
  title: z.string().min(1).max(300),
  frequency: z.enum(["DAILY", "WEEKLY"]).default("DAILY"),
});

export const reminderCreateSchema = z.object({
  taskId: z.string().uuid().optional(),
  remindAt: z.string().datetime(),
});

export function pagination(searchParams: URLSearchParams): { take: number; skip: number } {
  const take = Math.min(Math.max(Number(searchParams.get("take") ?? 50) || 50, 1), 100);
  const skip = Math.max(Number(searchParams.get("skip") ?? 0) || 0, 0);
  return { take, skip };
}
