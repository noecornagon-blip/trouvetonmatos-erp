import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/badge";

export default async function DevisPage() {
  const quotes = await prisma.quote.findMany({
    orderBy: { createdAt: "desc" },
    include: { customer: true },
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Devis" action={{ href: "/devis/new", label: "Nouveau devis" }} />

      <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="px-4 py-3">N°</th>
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3">Total TTC</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {quotes.map((quote) => (
              <tr key={quote.id} className="hover:bg-zinc-50">
                <td className="px-4 py-3 font-medium text-zinc-900">
                  <Link href={`/devis/${quote.id}`}>{quote.number}</Link>
                </td>
                <td className="px-4 py-3 text-zinc-600">{quote.customer.companyName}</td>
                <td className="px-4 py-3 text-zinc-600">
                  {Number(quote.totalTtc).toLocaleString("fr-FR")} €
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={quote.status} />
                </td>
                <td className="px-4 py-3 text-zinc-600">
                  {quote.issueDate.toLocaleDateString("fr-FR")}
                </td>
              </tr>
            ))}
            {quotes.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-zinc-400">
                  Aucun devis pour le moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
