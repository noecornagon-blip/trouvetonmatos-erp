import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { TaskForm } from "../task-form";

export default async function NewTaskPage() {
  const users = await prisma.user.findMany({
    where: { active: true },
    select: { id: true, firstName: true, lastName: true },
    orderBy: { firstName: "asc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Nouvelle tâche" />
      <TaskForm users={users} />
    </div>
  );
}
