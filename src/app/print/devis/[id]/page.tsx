import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PrintButton } from "@/components/print-button";

export default async function PrintQuotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [quote, company] = await Promise.all([
    prisma.quote.findUnique({
      where: { id },
      include: { customer: true, items: true },
    }),
    prisma.company.findFirst(),
  ]);
  if (!quote) notFound();

  return (
    <div className="mx-auto max-w-2xl p-8 text-sm text-zinc-900">
      <div className="mb-6 flex items-center justify-between print:hidden">
        <span className="text-zinc-500">Aperçu avant impression</span>
        <PrintButton />
      </div>

      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-lg font-semibold">{company?.name ?? "TrouveTonMatos"}</h1>
          {company?.address && <p>{company.address}</p>}
          {company?.postalCode && company?.city && (
            <p>
              {company.postalCode} {company.city}
            </p>
          )}
          {company?.siret && <p>SIRET : {company.siret}</p>}
        </div>
        <div className="text-right">
          <h2 className="text-lg font-semibold">Devis {quote.number}</h2>
          <p className="text-zinc-500">
            Émis le {quote.issueDate.toLocaleDateString("fr-FR")}
          </p>
          {quote.validUntil && (
            <p className="text-zinc-500">
              Valide jusqu&apos;au {quote.validUntil.toLocaleDateString("fr-FR")}
            </p>
          )}
        </div>
      </div>

      <div className="mb-8">
        <p className="font-medium">{quote.customer.companyName}</p>
        {quote.customer.address && <p>{quote.customer.address}</p>}
        {quote.customer.postalCode && quote.customer.city && (
          <p>
            {quote.customer.postalCode} {quote.customer.city}
          </p>
        )}
      </div>

      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-zinc-300 text-left">
            <th className="py-2">Description</th>
            <th className="py-2 text-right">Qté</th>
            <th className="py-2 text-right">PU HT</th>
            <th className="py-2 text-right">TVA</th>
            <th className="py-2 text-right">Total HT</th>
          </tr>
        </thead>
        <tbody>
          {quote.items.map((item) => (
            <tr key={item.id} className="border-b border-zinc-100">
              <td className="py-2">{item.description}</td>
              <td className="py-2 text-right">{item.quantity}</td>
              <td className="py-2 text-right">
                {Number(item.unitPriceHt).toLocaleString("fr-FR")} €
              </td>
              <td className="py-2 text-right">{Number(item.vatRate)}%</td>
              <td className="py-2 text-right">
                {(item.quantity * Number(item.unitPriceHt)).toLocaleString("fr-FR")} €
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 flex flex-col items-end gap-1">
        <p>Total HT : {Number(quote.totalHt).toLocaleString("fr-FR")} €</p>
        <p>TVA : {Number(quote.totalTva).toLocaleString("fr-FR")} €</p>
        <p className="text-base font-semibold">
          Total TTC : {Number(quote.totalTtc).toLocaleString("fr-FR")} €
        </p>
      </div>

      {quote.notes && (
        <div className="mt-8 border-t border-zinc-200 pt-4 text-zinc-600">
          {quote.notes}
        </div>
      )}
    </div>
  );
}
