import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/badge";

export default async function AchatsPage() {
  const purchaseOrders = await prisma.purchaseOrder.findMany({
    orderBy: { createdAt: "desc" },
    include: { supplier: true },
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Achats" action={{ href: "/achats/new", label: "Nouveau bon de commande" }} />

      <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="px-4 py-3">N°</th>
              <th className="px-4 py-3">Fournisseur</th>
              <th className="px-4 py-3">Total TTC</th>
              <th className="px-4 py-3">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {purchaseOrders.map((po) => (
              <tr key={po.id} className="hover:bg-zinc-50">
                <td className="px-4 py-3 font-medium text-zinc-900">
                  <Link href={`/achats/${po.id}`}>{po.number}</Link>
                </td>
                <td className="px-4 py-3 text-zinc-600">{po.supplier.companyName}</td>
                <td className="px-4 py-3 text-zinc-600">
                  {Number(po.totalTtc).toLocaleString("fr-FR")} €
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={po.status} />
                </td>
              </tr>
            ))}
            {purchaseOrders.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-zinc-400">
                  Aucun achat pour le moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
