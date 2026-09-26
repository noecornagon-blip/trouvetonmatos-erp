import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { PurchaseOrderStatusSelect } from "../purchase-order-status-select";

export default async function PurchaseOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const po = await prisma.purchaseOrder.findUnique({
    where: { id },
    include: { supplier: true, items: true, invoices: true },
  });
  if (!po) notFound();

  const realCost =
    Number(po.totalHt) + Number(po.transportCost) + Number(po.otherFees);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <PageHeader title={`Bon de commande ${po.number}`} />
        <PurchaseOrderStatusSelect purchaseOrderId={id} value={po.status} />
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-4 text-sm">
        <p>
          Fournisseur :{" "}
          <Link href={`/fournisseurs/${po.supplierId}`} className="font-medium text-zinc-900 hover:underline">
            {po.supplier.companyName}
          </Link>
        </p>
        <p className="text-zinc-500">
          Commandé le {po.orderDate.toLocaleDateString("fr-FR")}
          {po.receivedDate && ` — reçu le ${po.receivedDate.toLocaleDateString("fr-FR")}`}
        </p>
        {po.invoices.length > 0 && (
          <p className="mt-1">
            Factures :{" "}
            {po.invoices.map((inv) => (
              <Link key={inv.id} href={`/factures/${inv.id}`} className="mr-2 text-zinc-900 hover:underline">
                {inv.number}
              </Link>
            ))}
          </p>
        )}
        {po.invoices.length === 0 && (
          <p className="mt-2">
            <Link href={`/factures/new?purchaseOrderId=${po.id}`} className="text-sm text-zinc-900 underline">
              Générer une facture fournisseur
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
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {po.items.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3 text-zinc-900">{item.description}</td>
                <td className="px-4 py-3 text-zinc-600">{item.quantity}</td>
                <td className="px-4 py-3 text-zinc-600">
                  {Number(item.unitPriceHt).toLocaleString("fr-FR")} €
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Total HT matériel" value={`${Number(po.totalHt).toLocaleString("fr-FR")} €`} />
        <Stat label="Transport" value={`${Number(po.transportCost).toLocaleString("fr-FR")} €`} />
        <Stat label="Autres frais" value={`${Number(po.otherFees).toLocaleString("fr-FR")} €`} />
        <Stat label="Coût réel d'acquisition" value={`${realCost.toLocaleString("fr-FR")} €`} />
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
