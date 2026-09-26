import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const [openRequests, urgentTasks, unpaidInvoices, bankAccounts] =
    await Promise.all([
      prisma.request.count({
        where: { status: { in: ["NOUVELLE", "EN_RECHERCHE", "PROPOSITION_ENVOYEE"] } },
      }),
      prisma.task.findMany({
        where: { status: { not: "TERMINEE" }, priority: { in: ["HAUTE", "URGENTE"] } },
        orderBy: { dueDate: "asc" },
        take: 5,
        include: { assignee: true },
      }),
      prisma.invoice.aggregate({
        where: { type: "CLIENT", status: { in: ["ENVOYEE", "EN_RETARD"] } },
        _sum: { totalTtc: true },
      }),
      prisma.bankAccount.findMany(),
    ]);

  const treasuryBalance = bankAccounts.reduce(
    (sum, account) => sum + Number(account.openingBalance),
    0
  );

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-zinc-900">Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Trésorerie (solde simplifié)"
          value={`${treasuryBalance.toLocaleString("fr-FR")} €`}
        />
        <StatCard
          label="Factures clients en attente"
          value={`${Number(unpaidInvoices._sum.totalTtc ?? 0).toLocaleString("fr-FR")} €`}
        />
        <StatCard label="Demandes ouvertes" value={String(openRequests)} />
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-4">
        <h2 className="mb-3 text-sm font-semibold text-zinc-900">
          Tâches urgentes
        </h2>
        {urgentTasks.length === 0 ? (
          <p className="text-sm text-zinc-500">Aucune tâche urgente.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {urgentTasks.map((task) => (
              <li
                key={task.id}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-zinc-800">{task.title}</span>
                <span className="text-zinc-500">
                  {task.assignee?.firstName} {task.assignee?.lastName}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-zinc-400">
        {label}
      </div>
      <div className="mt-1 text-2xl font-semibold text-zinc-900">{value}</div>
    </div>
  );
}
