import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";

const ENTITY_LABEL: Record<string, string> = {
  customer: "Client",
  supplier: "Fournisseur",
  request: "Demande",
  equipment: "Matériel",
  quote: "Devis",
  sale: "Vente",
  purchase_order: "Achat",
  invoice: "Facture",
  task: "Tâche",
  bank_account: "Compte bancaire",
  bank_transaction: "Mouvement bancaire",
};

export default async function JournalPage() {
  const logs = await prisma.activityLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { user: true },
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Journal d'activité" />

      <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Utilisateur</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Entité</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {logs.map((log) => (
              <tr key={log.id}>
                <td className="px-4 py-3 whitespace-nowrap text-zinc-600">
                  {log.createdAt.toLocaleString("fr-FR")}
                </td>
                <td className="px-4 py-3 text-zinc-900">
                  {log.user.firstName} {log.user.lastName}
                </td>
                <td className="px-4 py-3 text-zinc-600">{log.action}</td>
                <td className="px-4 py-3 text-zinc-600">
                  {ENTITY_LABEL[log.entityType] ?? log.entityType}
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-zinc-400">
                  Aucune activité enregistrée.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
