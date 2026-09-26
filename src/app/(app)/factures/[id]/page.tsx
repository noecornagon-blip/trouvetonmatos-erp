import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { InvoiceStatusSelect } from "../invoice-status-select";
import { addPayment } from "../actions";

const TYPE_LABEL: Record<string, string> = {
  CLIENT: "Client",
  FOURNISSEUR: "Fournisseur",
  AVOIR: "Avoir",
  ACOMPTE: "Acompte",
};

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { customer: true, supplier: true, items: true, payments: true, sale: true, purchaseOrder: true },
  });
  if (!invoice) notFound();

  const totalPaid = invoice.payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const remaining = Number(invoice.totalTtc) - totalPaid;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <PageHeader title={`Facture ${invoice.number}`} />
        <InvoiceStatusSelect invoiceId={id} value={invoice.status} />
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-4 text-sm">
        <p>Type : {TYPE_LABEL[invoice.type]}</p>
        {invoice.customer && (
          <p>
            Client :{" "}
            <Link href={`/clients/${invoice.customerId}`} className="font-medium text-zinc-900 hover:underline">
              {invoice.customer.companyName}
            </Link>
          </p>
        )}
        {invoice.supplier && (
          <p>
            Fournisseur :{" "}
            <Link href={`/fournisseurs/${invoice.supplierId}`} className="font-medium text-zinc-900 hover:underline">
              {invoice.supplier.companyName}
            </Link>
          </p>
        )}
        {invoice.dueDate && (
          <p className="text-zinc-500">Échéance : {invoice.dueDate.toLocaleDateString("fr-FR")}</p>
        )}
        {invoice.sale && (
          <p className="mt-1">
            Vente liée :{" "}
            <Link href={`/ventes/${invoice.sale.id}`} className="text-zinc-900 hover:underline">
              {invoice.sale.number}
            </Link>
          </p>
        )}
        {invoice.purchaseOrder && (
          <p className="mt-1">
            Achat lié :{" "}
            <Link href={`/achats/${invoice.purchaseOrder.id}`} className="text-zinc-900 hover:underline">
              {invoice.purchaseOrder.number}
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
            {invoice.items.map((item) => (
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

      <div className="grid grid-cols-3 gap-4">
        <Stat label="Total TTC" value={`${Number(invoice.totalTtc).toLocaleString("fr-FR")} €`} />
        <Stat label="Payé" value={`${totalPaid.toLocaleString("fr-FR")} €`} />
        <Stat label="Restant dû" value={`${remaining.toLocaleString("fr-FR")} €`} />
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-zinc-900">Paiements</h2>
        <ul className="flex flex-col gap-1">
          {invoice.payments.map((payment) => (
            <li key={payment.id} className="text-sm text-zinc-600">
              {Number(payment.amount).toLocaleString("fr-FR")} € — {payment.method} —{" "}
              {payment.paymentDate.toLocaleDateString("fr-FR")}
              {payment.reference && ` (${payment.reference})`}
            </li>
          ))}
          {invoice.payments.length === 0 && (
            <p className="text-sm text-zinc-400">Aucun paiement enregistré.</p>
          )}
        </ul>

        {remaining > 0 && (
          <form
            action={addPayment.bind(null, id)}
            className="flex max-w-xl flex-wrap items-end gap-2 rounded-md border border-dashed border-zinc-300 p-3"
          >
            <div className="flex flex-col gap-1">
              <label className="text-xs text-zinc-500">Montant (€)</label>
              <input
                name="amount"
                type="number"
                step="0.01"
                defaultValue={remaining}
                className="w-32 rounded-md border border-zinc-300 px-2 py-1 text-sm"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-zinc-500">Moyen</label>
              <select name="method" className="rounded-md border border-zinc-300 px-2 py-1 text-sm">
                <option value="VIREMENT">Virement</option>
                <option value="CHEQUE">Chèque</option>
                <option value="CB">Carte bancaire</option>
                <option value="ESPECES">Espèces</option>
                <option value="AUTRE">Autre</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-zinc-500">Référence</label>
              <input name="reference" className="rounded-md border border-zinc-300 px-2 py-1 text-sm" />
            </div>
            <button
              type="submit"
              className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-100"
            >
              Enregistrer le paiement
            </button>
          </form>
        )}
      </section>
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
