"use client";

import { useCallback, useEffect, useState } from "react";
import { api, type Priority, type Task } from "@/lib/api";

const NEXT_PRIORITY: Record<Priority, Priority> = { HIGH: "MEDIUM", MEDIUM: "LOW", LOW: "HIGH" };

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.tasks.list("?take=100");
      setTasks(data.items);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function run(id: string | null, fn: () => Promise<void>) {
    if (id) setBusyId(id);
    setError(null);
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setBusyId(null);
    }
  }

  const addTask = (title: string) =>
    run(null, async () => {
      const { item } = await api.tasks.create({ title });
      setTasks((prev) => [item, ...prev]);
    });

  const toggleTask = (task: Task) =>
    run(task.id, async () => {
      const { item } = await api.tasks.update(task.id, {
        status: task.status === "DONE" ? "PLANNED" : "DONE",
      });
      setTasks((prev) => prev.map((t) => (t.id === task.id ? item : t)));
    });

  const cyclePriority = (task: Task) =>
    run(task.id, async () => {
      const { item } = await api.tasks.update(task.id, { priority: NEXT_PRIORITY[task.priority] });
      setTasks((prev) => prev.map((t) => (t.id === task.id ? item : t)));
    });

  const deleteTask = (task: Task) =>
    run(task.id, async () => {
      await api.tasks.remove(task.id);
      setTasks((prev) => prev.filter((t) => t.id !== task.id));
    });

  return { tasks, loading, error, busyId, reload: load, addTask, toggleTask, cyclePriority, deleteTask };
}

export function greeting(now = new Date()): string {
  const h = now.getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}
