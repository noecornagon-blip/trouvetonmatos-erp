import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { QuoteControls } from "../quote-controls";

export default async function QuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const quote = await prisma.quote.findUnique({
    where: { id },
    include: { customer: true, items: true, sale: true },
  });
  if (!quote) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <PageHeader title={`Devis ${quote.number}`} />
        <div className="flex items-center gap-2">
          <Link
            href={`/print/devis/${id}`}
            target="_blank"
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-100"
          >
            Imprimer / PDF
          </Link>
          <QuoteControls quoteId={id} status={quote.status} hasSale={!!quote.sale} />
        </div>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-4 text-sm">
        <p>
          Client :{" "}
          <Link href={`/clients/${quote.customerId}`} className="font-medium text-zinc-900 hover:underline">
            {quote.customer.companyName}
          </Link>
        </p>
        <p className="text-zinc-500">
          Émis le {quote.issueDate.toLocaleDateString("fr-FR")}
          {quote.validUntil && ` — valide jusqu'au ${quote.validUntil.toLocaleDateString("fr-FR")}`}
        </p>
        {quote.sale && (
          <p className="mt-1">
            Vente liée :{" "}
            <Link href={`/ventes/${quote.sale.id}`} className="text-zinc-900 hover:underline">
              {quote.sale.number}
            </Link>
          </p>
        )}
      </div>

      <QuoteItemsTable items={quote.items} totals={quote} />
    </div>
  );
}

function QuoteItemsTable({
  items,
  totals,
}: {
  items: { id: string; description: string; quantity: number; unitPriceHt: unknown; vatRate: unknown }[];
  totals: { totalHt: unknown; totalTva: unknown; totalTtc: unknown };
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
      <table className="w-full text-sm">
        <thead className="bg-zinc-50 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
          <tr>
            <th className="px-4 py-3">Description</th>
            <th className="px-4 py-3">Qté</th>
            <th className="px-4 py-3">PU HT</th>
            <th className="px-4 py-3">TVA</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {items.map((item) => (
            <tr key={item.id}>
              <td className="px-4 py-3 text-zinc-900">{item.description}</td>
              <td className="px-4 py-3 text-zinc-600">{item.quantity}</td>
              <td className="px-4 py-3 text-zinc-600">
                {Number(item.unitPriceHt).toLocaleString("fr-FR")} €
              </td>
              <td className="px-4 py-3 text-zinc-600">{Number(item.vatRate)}%</td>
            </tr>
          ))}
        </tbody>
        <tfoot className="border-t border-zinc-200 text-sm">
          <tr>
            <td colSpan={3} className="px-4 py-2 text-right text-zinc-500">
              Total HT
            </td>
            <td className="px-4 py-2 font-medium text-zinc-900">
              {Number(totals.totalHt).toLocaleString("fr-FR")} €
            </td>
          </tr>
          <tr>
            <td colSpan={3} className="px-4 py-2 text-right text-zinc-500">
              TVA
            </td>
            <td className="px-4 py-2 font-medium text-zinc-900">
              {Number(totals.totalTva).toLocaleString("fr-FR")} €
            </td>
          </tr>
          <tr>
            <td colSpan={3} className="px-4 py-2 text-right text-zinc-500">
              Total TTC
            </td>
            <td className="px-4 py-2 font-semibold text-zinc-900">
              {Number(totals.totalTtc).toLocaleString("fr-FR")} €
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
