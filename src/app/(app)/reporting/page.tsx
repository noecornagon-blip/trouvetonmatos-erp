import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export default async function ReportingPage() {
  const sales = await prisma.sale.findMany({
    where: { status: { not: "ANNULEE" } },
    include: { customer: true },
  });

  const byMonth = new Map<string, { ca: number; marge: number }>();
  for (const sale of sales) {
    const key = monthKey(sale.createdAt);
    const entry = byMonth.get(key) ?? { ca: 0, marge: 0 };
    entry.ca += Number(sale.totalHt);
    entry.marge += Number(sale.marginHt);
    byMonth.set(key, entry);
  }
  const months = [...byMonth.entries()].sort(([a], [b]) => a.localeCompare(b));
  const maxCa = Math.max(1, ...months.map(([, v]) => v.ca));

  const byCustomer = new Map<string, { name: string; ca: number }>();
  for (const sale of sales) {
    const entry = byCustomer.get(sale.customerId) ?? { name: sale.customer.companyName, ca: 0 };
    entry.ca += Number(sale.totalHt);
    byCustomer.set(sale.customerId, entry);
  }
  const topCustomers = [...byCustomer.values()].sort((a, b) => b.ca - a.ca).slice(0, 5);

  const totalCa = sales.reduce((sum, s) => sum + Number(s.totalHt), 0);
  const totalMarge = sales.reduce((sum, s) => sum + Number(s.marginHt), 0);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Reporting" />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Stat label="CA total HT" value={`${totalCa.toLocaleString("fr-FR")} €`} />
        <Stat label="Marge totale HT" value={`${totalMarge.toLocaleString("fr-FR")} €`} />
        <Stat
          label="Taux de marge"
          value={totalCa > 0 ? `${((totalMarge / totalCa) * 100).toFixed(1)} %` : "—"}
        />
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-zinc-900">CA par mois (HT)</h2>
        <div className="flex flex-col gap-2 rounded-lg border border-zinc-200 bg-white p-4">
          {months.map(([key, v]) => (
            <div key={key} className="flex items-center gap-3 text-sm">
              <span className="w-16 text-zinc-500">{key}</span>
              <div className="h-4 flex-1 rounded bg-zinc-100">
                <div
                  className="h-4 rounded bg-zinc-900"
                  style={{ width: `${(v.ca / maxCa) * 100}%` }}
                />
              </div>
              <span className="w-28 text-right text-zinc-600">
                {v.ca.toLocaleString("fr-FR")} €
              </span>
            </div>
          ))}
          {months.length === 0 && (
            <p className="text-sm text-zinc-400">Pas encore de données de vente.</p>
          )}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-zinc-900">Top clients (CA HT)</h2>
        <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
          <table className="w-full text-sm">
            <tbody className="divide-y divide-zinc-100">
              {topCustomers.map((c) => (
                <tr key={c.name}>
                  <td className="px-4 py-2 text-zinc-900">{c.name}</td>
                  <td className="px-4 py-2 text-right text-zinc-600">
                    {c.ca.toLocaleString("fr-FR")} €
                  </td>
                </tr>
              ))}
              {topCustomers.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-center text-zinc-400">Aucune donnée.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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
