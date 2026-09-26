import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { SaleStatusSelect } from "../sale-status-select";

export default async function SaleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sale = await prisma.sale.findUnique({
    where: { id },
    include: { customer: true, items: true, quote: true, invoices: true },
  });
  if (!sale) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <PageHeader title={`Vente ${sale.number}`} />
        <SaleStatusSelect saleId={id} value={sale.status} />
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-4 text-sm">
        <p>
          Client :{" "}
          <Link href={`/clients/${sale.customerId}`} className="font-medium text-zinc-900 hover:underline">
            {sale.customer.companyName}
          </Link>
        </p>
        {sale.quote && (
          <p className="mt-1">
            Devis d&apos;origine :{" "}
            <Link href={`/devis/${sale.quote.id}`} className="text-zinc-900 hover:underline">
              {sale.quote.number}
            </Link>
          </p>
        )}
        {sale.invoices.length > 0 && (
          <p className="mt-1">
            Factures :{" "}
            {sale.invoices.map((inv) => (
              <Link key={inv.id} href={`/factures/${inv.id}`} className="mr-2 text-zinc-900 hover:underline">
                {inv.number}
              </Link>
            ))}
          </p>
        )}
        {sale.invoices.length === 0 && (
          <p className="mt-2">
            <Link
              href={`/factures/new?saleId=${sale.id}`}
              className="text-sm text-zinc-900 underline"
            >
              Générer une facture client
            </Link>
          </p>
        )}
      </div>

      <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3">Qté</th>
              <th className="px-4 py-3">PU HT</th>
              <th className="px-4 py-3">Coût HT</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {sale.items.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3 text-zinc-900">{item.description}</td>
                <td className="px-4 py-3 text-zinc-600">{item.quantity}</td>
                <td className="px-4 py-3 text-zinc-600">
                  {Number(item.unitPriceHt).toLocaleString("fr-FR")} €
                </td>
                <td className="px-4 py-3 text-zinc-600">
                  {Number(item.unitCostHt).toLocaleString("fr-FR")} €
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Total HT" value={`${Number(sale.totalHt).toLocaleString("fr-FR")} €`} />
        <Stat label="Total TTC" value={`${Number(sale.totalTtc).toLocaleString("fr-FR")} €`} />
        <Stat label="Coût total HT" value={`${Number(sale.totalCostHt).toLocaleString("fr-FR")} €`} />
        <Stat label="Marge HT" value={`${Number(sale.marginHt).toLocaleString("fr-FR")} €`} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-zinc-400">{label}</div>
      <div className="mt-1 text-lg font-semibold text-zinc-900">{value}</div>
    </div>
  );
}
