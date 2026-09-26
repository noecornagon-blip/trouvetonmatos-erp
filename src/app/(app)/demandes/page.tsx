import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/badge";

export default async function DemandesPage() {
  const requests = await prisma.request.findMany({
    orderBy: { createdAt: "desc" },
    include: { customer: true, matches: true },
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Demandes de matériel"
        action={{ href: "/demandes/new", label: "Nouvelle demande" }}
      />

      <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="px-4 py-3">Titre</th>
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3">Priorité</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Correspondances</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {requests.map((request) => (
              <tr key={request.id} className="hover:bg-zinc-50">
                <td className="px-4 py-3 font-medium text-zinc-900">
                  <Link href={`/demandes/${request.id}`}>{request.title}</Link>
                </td>
                <td className="px-4 py-3 text-zinc-600">
                  {request.customer.companyName}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={request.priority} />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={request.status} />
                </td>
                <td className="px-4 py-3 text-zinc-600">
                  {request.matches.length}
                </td>
              </tr>
            ))}
            {requests.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-zinc-400">
                  Aucune demande pour le moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
