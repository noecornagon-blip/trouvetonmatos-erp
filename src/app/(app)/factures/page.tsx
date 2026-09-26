import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/badge";

const TYPE_LABEL: Record<string, string> = {
  CLIENT: "Client",
  FOURNISSEUR: "Fournisseur",
  AVOIR: "Avoir",
  ACOMPTE: "Acompte",
};

export default async function FacturesPage() {
  const invoices = await prisma.invoice.findMany({
    orderBy: { createdAt: "desc" },
    include: { customer: true, supplier: true },
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Factures" action={{ href: "/factures/new", label: "Nouvelle facture" }} />

      <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="px-4 py-3">N°</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Tiers</th>
              <th className="px-4 py-3">Total TTC</th>
              <th className="px-4 py-3">Échéance</th>
              <th className="px-4 py-3">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {invoices.map((invoice) => (
              <tr key={invoice.id} className="hover:bg-zinc-50">
                <td className="px-4 py-3 font-medium text-zinc-900">
                  <Link href={`/factures/${invoice.id}`}>{invoice.number}</Link>
                </td>
                <td className="px-4 py-3 text-zinc-600">{TYPE_LABEL[invoice.type]}</td>
                <td className="px-4 py-3 text-zinc-600">
                  {invoice.customer?.companyName ?? invoice.supplier?.companyName ?? "—"}
                </td>
                <td className="px-4 py-3 text-zinc-600">
                  {Number(invoice.totalTtc).toLocaleString("fr-FR")} €
                </td>
                <td className="px-4 py-3 text-zinc-600">
                  {invoice.dueDate ? invoice.dueDate.toLocaleDateString("fr-FR") : "—"}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={invoice.status} />
                </td>
              </tr>
            ))}
            {invoices.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-zinc-400">
                  Aucune facture pour le moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
