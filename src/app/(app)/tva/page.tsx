import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/badge";
import { createVatRecord } from "./actions";
import { ValidateButton } from "./validate-button";

export default async function TvaPage() {
  const records = await prisma.vatRecord.findMany({
    orderBy: { periodStart: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="TVA" />

      <form
        action={createVatRecord}
        className="flex max-w-xl flex-wrap items-end gap-2 rounded-md border border-dashed border-zinc-300 p-3"
      >
        <div className="flex flex-col gap-1">
          <label className="text-xs text-zinc-500">Début de période</label>
          <input name="periodStart" type="date" required className="rounded-md border border-zinc-300 px-2 py-1 text-sm" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-zinc-500">Fin de période</label>
          <input name="periodEnd" type="date" required className="rounded-md border border-zinc-300 px-2 py-1 text-sm" />
        </div>
        <button type="submit" className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-700">
          Calculer la déclaration
        </button>
      </form>

      <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="px-4 py-3">Période</th>
              <th className="px-4 py-3">TVA collectée</th>
              <th className="px-4 py-3">TVA déductible</th>
              <th className="px-4 py-3">Solde à payer</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {records.map((record) => (
              <tr key={record.id}>
                <td className="px-4 py-3 text-zinc-600">
                  {record.periodStart.toLocaleDateString("fr-FR")} — {record.periodEnd.toLocaleDateString("fr-FR")}
                </td>
                <td className="px-4 py-3 text-zinc-600">
                  {Number(record.vatCollected).toLocaleString("fr-FR")} €
                </td>
                <td className="px-4 py-3 text-zinc-600">
                  {Number(record.vatDeductible).toLocaleString("fr-FR")} €
                </td>
                <td className="px-4 py-3 font-medium text-zinc-900">
                  {(Number(record.vatCollected) - Number(record.vatDeductible)).toLocaleString("fr-FR")} €
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={record.status} />
                </td>
                <td className="px-4 py-3">
                  {record.status === "BROUILLON" && <ValidateButton id={record.id} />}
                </td>
              </tr>
            ))}
            {records.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-zinc-400">
                  Aucune déclaration pour le moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
