import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";

export default async function DepensesPage() {
  const expenses = await prisma.expense.findMany({
    orderBy: { expenseDate: "desc" },
  });

  const total = expenses.reduce((sum, e) => sum + Number(e.amount) + Number(e.vatAmount), 0);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Dépenses" action={{ href: "/depenses/new", label: "Nouvelle dépense" }} />

      <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Libellé</th>
              <th className="px-4 py-3">Catégorie</th>
              <th className="px-4 py-3">Montant HT</th>
              <th className="px-4 py-3">TVA</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {expenses.map((expense) => (
              <tr key={expense.id}>
                <td className="px-4 py-3 text-zinc-600">
                  {expense.expenseDate.toLocaleDateString("fr-FR")}
                </td>
                <td className="px-4 py-3 text-zinc-900">{expense.label}</td>
                <td className="px-4 py-3 text-zinc-600">{expense.category ?? "—"}</td>
                <td className="px-4 py-3 text-zinc-600">
                  {Number(expense.amount).toLocaleString("fr-FR")} €
                </td>
                <td className="px-4 py-3 text-zinc-600">
                  {Number(expense.vatAmount).toLocaleString("fr-FR")} €
                </td>
              </tr>
            ))}
            {expenses.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-zinc-400">
                  Aucune dépense pour le moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-sm text-zinc-500">
        Total dépenses TTC : {total.toLocaleString("fr-FR")} €
      </p>
    </div>
  );
}
