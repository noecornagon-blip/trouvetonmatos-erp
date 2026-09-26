import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/badge";
import { TaskStatusSelect } from "./task-status-select";
import type { TaskStatus } from "@/generated/prisma/client";

const COLUMNS: { status: TaskStatus; label: string }[] = [
  { status: "A_FAIRE", label: "À faire" },
  { status: "EN_COURS", label: "En cours" },
  { status: "EN_ATTENTE", label: "En attente" },
  { status: "TERMINEE", label: "Terminée" },
];

export default async function TachesPage() {
  const tasks = await prisma.task.findMany({
    orderBy: [{ priority: "desc" }, { dueDate: "asc" }],
    include: { assignee: true },
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Tâches"
        action={{ href: "/taches/new", label: "Nouvelle tâche" }}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        {COLUMNS.map((column) => {
          const columnTasks = tasks.filter((t) => t.status === column.status);
          return (
            <div key={column.status} className="flex flex-col gap-2">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                {column.label} ({columnTasks.length})
              </h2>
              <div className="flex flex-col gap-2">
                {columnTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex flex-col gap-2 rounded-lg border border-zinc-200 bg-white p-3"
                  >
                    <p className="text-sm font-medium text-zinc-900">
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={task.priority} />
                      {task.dueDate && (
                        <span className="text-xs text-zinc-500">
                          {task.dueDate.toLocaleDateString("fr-FR")}
                        </span>
                      )}
                    </div>
                    {task.assignee && (
                      <span className="text-xs text-zinc-500">
                        {task.assignee.firstName} {task.assignee.lastName}
                      </span>
                    )}
                    <TaskStatusSelect taskId={task.id} value={task.status} />
                  </div>
                ))}
                {columnTasks.length === 0 && (
                  <p className="text-xs text-zinc-400">Aucune tâche.</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
