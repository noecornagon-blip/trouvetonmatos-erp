import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { createBankAccount, createBankTransaction } from "./actions";
import { ReconcileButton } from "./reconcile-button";

export default async function TresoreriePage() {
  const [accounts, transactions, upcomingClientInvoices, upcomingSupplierInvoices] =
    await Promise.all([
      prisma.bankAccount.findMany({ include: { transactions: true } }),
      prisma.bankTransaction.findMany({
        orderBy: { transactionDate: "desc" },
        take: 20,
        include: { bankAccount: true },
      }),
      prisma.invoice.findMany({
        where: { type: "CLIENT", status: { in: ["ENVOYEE", "EN_RETARD"] } },
      }),
      prisma.invoice.findMany({
        where: { type: "FOURNISSEUR", status: { in: ["ENVOYEE", "EN_RETARD"] } },
      }),
    ]);

  const accountBalances = accounts.map((account) => {
    const balance = account.transactions.reduce((sum, t) => {
      const amount = Number(t.amount);
      return t.type === "ENCAISSEMENT" ? sum + amount : sum - amount;
    }, Number(account.openingBalance));
    return { ...account, balance };
  });

  const totalBalance = accountBalances.reduce((sum, a) => sum + a.balance, 0);
  const expectedIn = upcomingClientInvoices.reduce((sum, i) => sum + Number(i.totalTtc), 0);
  const expectedOut = upcomingSupplierInvoices.reduce((sum, i) => sum + Number(i.totalTtc), 0);
  const forecast = totalBalance + expectedIn - expectedOut;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Trésorerie" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Stat label="Solde actuel" value={`${totalBalance.toLocaleString("fr-FR")} €`} />
        <Stat label="Encaissements attendus" value={`${expectedIn.toLocaleString("fr-FR")} €`} />
        <Stat label="Décaissements attendus" value={`${expectedOut.toLocaleString("fr-FR")} €`} />
        <Stat label="Prévisionnel" value={`${forecast.toLocaleString("fr-FR")} €`} />
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-zinc-900">Comptes bancaires</h2>
        <div className="flex flex-wrap gap-4">
          {accountBalances.map((account) => (
            <div key={account.id} className="w-56 rounded-lg border border-zinc-200 bg-white p-4">
              <div className="text-sm font-medium text-zinc-900">{account.name}</div>
              <div className="mt-1 text-xl font-semibold text-zinc-900">
                {account.balance.toLocaleString("fr-FR")} €
              </div>
            </div>
          ))}
        </div>

        <form
          action={createBankAccount}
          className="flex max-w-xl flex-wrap items-end gap-2 rounded-md border border-dashed border-zinc-300 p-3"
        >
          <div className="flex flex-col gap-1">
            <label className="text-xs text-zinc-500">Nom du compte</label>
            <input name="name" className="rounded-md border border-zinc-300 px-2 py-1 text-sm" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-zinc-500">Solde initial (€)</label>
            <input
              name="openingBalance"
              type="number"
              step="0.01"
              defaultValue={0}
              className="w-32 rounded-md border border-zinc-300 px-2 py-1 text-sm"
            />
          </div>
          <button type="submit" className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-100">
            Ajouter un compte
          </button>
        </form>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-900">Mouvements récents</h2>
          <Link href="/tresorerie/import" className="text-sm text-zinc-600 underline">
            Importer un relevé CSV
          </Link>
        </div>
        <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Compte</th>
                <th className="px-4 py-3">Libellé</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Montant</th>
                <th className="px-4 py-3">Rapprochement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {transactions.map((t) => (
                <tr key={t.id}>
                  <td className="px-4 py-3 text-zinc-600">
                    {t.transactionDate.toLocaleDateString("fr-FR")}
                  </td>
                  <td className="px-4 py-3 text-zinc-600">{t.bankAccount.name}</td>
                  <td className="px-4 py-3 text-zinc-900">{t.label}</td>
                  <td className="px-4 py-3 text-zinc-600">
                    {t.type === "ENCAISSEMENT" ? "Encaissement" : "Décaissement"}
                  </td>
                  <td className="px-4 py-3 text-zinc-600">
                    {t.type === "ENCAISSEMENT" ? "+" : "-"}
                    {Number(t.amount).toLocaleString("fr-FR")} €
                  </td>
                  <td className="px-4 py-3">
                    {t.reconciled ? (
                      <span className="text-xs text-emerald-600">Rapproché</span>
                    ) : (
                      <ReconcileButton id={t.id} />
                    )}
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-zinc-400">
                    Aucun mouvement pour le moment.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <form
          action={createBankTransaction}
          className="flex max-w-2xl flex-wrap items-end gap-2 rounded-md border border-dashed border-zinc-300 p-3"
        >
          <div className="flex flex-col gap-1">
            <label className="text-xs text-zinc-500">Compte</label>
            <select name="bankAccountId" className="rounded-md border border-zinc-300 px-2 py-1 text-sm">
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-zinc-500">Type</label>
            <select name="type" className="rounded-md border border-zinc-300 px-2 py-1 text-sm">
              <option value="ENCAISSEMENT">Encaissement</option>
              <option value="DECAISSEMENT">Décaissement</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-zinc-500">Libellé</label>
            <input name="label" className="rounded-md border border-zinc-300 px-2 py-1 text-sm" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-zinc-500">Montant (€)</label>
            <input
              name="amount"
              type="number"
              step="0.01"
              className="w-32 rounded-md border border-zinc-300 px-2 py-1 text-sm"
            />
          </div>
          <button type="submit" className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-100">
            Enregistrer
          </button>
        </form>
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
