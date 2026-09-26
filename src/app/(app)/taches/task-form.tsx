"use client";

import { useActionState } from "react";
import { createTask } from "./actions";

export function TaskForm({
  users,
}: {
  users: { id: string; firstName: string; lastName: string }[];
}) {
  const [message, formAction, isPending] = useActionState(createTask, undefined);

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-zinc-700">Titre</label>
        <input
          name="title"
          required
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-zinc-700">Description</label>
        <textarea
          name="description"
          rows={3}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-zinc-700">Priorité</label>
          <select
            name="priority"
            defaultValue="NORMALE"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
          >
            <option value="BASSE">Basse</option>
            <option value="NORMALE">Normale</option>
            <option value="HAUTE">Haute</option>
            <option value="URGENTE">Urgente</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-zinc-700">Échéance</label>
          <input
            name="dueDate"
            type="date"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
          />
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-zinc-700">Assigné à</label>
        <select
          name="assigneeId"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
        >
          <option value="">—</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.firstName} {u.lastName}
            </option>
          ))}
        </select>
      </div>

      {message && <p className="text-sm text-zinc-600">{message}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="mt-2 w-fit rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-60"
      >
        {isPending ? "Création…" : "Créer la tâche"}
      </button>
    </form>
  );
}
