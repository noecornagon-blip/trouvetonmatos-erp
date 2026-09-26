import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { ImportForm } from "./import-form";

export default async function ImportBankCsvPage() {
  const accounts = await prisma.bankAccount.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Import relevé bancaire (CSV)" />
      {accounts.length === 0 ? (
        <p className="text-sm text-zinc-500">
          Créez d&apos;abord un compte bancaire depuis la page Trésorerie.
        </p>
      ) : (
        <ImportForm accounts={accounts} />
      )}
    </div>
  );
}
