import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/badge";

export default async function VentesPage() {
  const sales = await prisma.sale.findMany({
    orderBy: { createdAt: "desc" },
    include: { customer: true },
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Ventes" action={{ href: "/ventes/new", label: "Nouvelle vente" }} />

      <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="px-4 py-3">N°</th>
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3">Total TTC</th>
              <th className="px-4 py-3">Marge HT</th>
              <th className="px-4 py-3">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {sales.map((sale) => (
              <tr key={sale.id} className="hover:bg-zinc-50">
                <td className="px-4 py-3 font-medium text-zinc-900">
                  <Link href={`/ventes/${sale.id}`}>{sale.number}</Link>
                </td>
                <td className="px-4 py-3 text-zinc-600">{sale.customer.companyName}</td>
                <td className="px-4 py-3 text-zinc-600">
                  {Number(sale.totalTtc).toLocaleString("fr-FR")} €
                </td>
                <td className="px-4 py-3 text-zinc-600">
                  {Number(sale.marginHt).toLocaleString("fr-FR")} €
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={sale.status} />
                </td>
              </tr>
            ))}
            {sales.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-zinc-400">
                  Aucune vente pour le moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
