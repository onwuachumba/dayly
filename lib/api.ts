export type Priority = "HIGH" | "MEDIUM" | "LOW";
export type TaskStatus = "PLANNED" | "DONE" | "MOVED";

export type Task = {
  id: string;
  title: string;
  detail?: string | null;
  timeLabel?: string | null;
  priority: Priority;
  status: TaskStatus;
  dueDate?: string | null;
  durationMin?: number | null;
  category?: string | null;
};

export type Goal = {
  id: string;
  title: string;
  target?: string | null;
  progress: number;
  status: "ACTIVE" | "DONE" | "ARCHIVED";
};

export type Habit = {
  id: string;
  title: string;
  frequency: string;
  streak: number;
  lastDoneAt?: string | null;
};

export type Reminder = {
  id: string;
  taskId?: string | null;
  remindAt: string;
  sent: boolean;
  task?: { title: string } | null;
};

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
  });
  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(res.status, data?.error?.message || `Request failed (${res.status})`);
  }
  return data as T;
}

export const api = {
  tasks: {
    list: (q = "") => request<{ items: Task[]; total: number }>(`/api/v1/tasks${q}`),
    create: (body: Partial<Task> & { title: string }) =>
      request<{ item: Task }>("/api/v1/tasks", { method: "POST", body: JSON.stringify(body) }),
    update: (id: string, body: Partial<Task>) =>
      request<{ item: Task }>(`/api/v1/tasks/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
    remove: (id: string) => request<void>(`/api/v1/tasks/${id}`, { method: "DELETE" }),
  },
  goals: {
    list: () => request<{ items: Goal[]; total: number }>("/api/v1/goals"),
    create: (body: { title: string; target?: string }) =>
      request<{ item: Goal }>("/api/v1/goals", { method: "POST", body: JSON.stringify(body) }),
    update: (id: string, body: Partial<Goal>) =>
      request<{ item: Goal }>(`/api/v1/goals/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
    remove: (id: string) => request<void>(`/api/v1/goals/${id}`, { method: "DELETE" }),
  },
  habits: {
    list: () => request<{ items: Habit[] }>("/api/v1/habits"),
    create: (body: { title: string; frequency?: string }) =>
      request<{ item: Habit }>("/api/v1/habits", { method: "POST", body: JSON.stringify(body) }),
    checkin: (id: string) =>
      request<{ item: Habit }>(`/api/v1/habits/${id}/checkin`, { method: "POST" }),
    remove: (id: string) => request<void>(`/api/v1/habits/${id}`, { method: "DELETE" }),
  },
  reminders: {
    list: (upcoming = false) =>
      request<{ items: Reminder[] }>(`/api/v1/reminders${upcoming ? "?upcoming=1" : ""}`),
    create: (body: { remindAt: string; taskId?: string }) =>
      request<{ item: Reminder }>("/api/v1/reminders", { method: "POST", body: JSON.stringify(body) }),
    remove: (id: string) => request<void>(`/api/v1/reminders/${id}`, { method: "DELETE" }),
  },
  me: () => request<{ user: { id: string; email: string; name: string | null } }>("/api/v1/me"),
};
