import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { SaleForm } from "../sale-form";

export default async function NewSalePage() {
  const [customers, equipment] = await Promise.all([
    prisma.customer.findMany({
      select: { id: true, companyName: true },
      orderBy: { companyName: "asc" },
    }),
    prisma.equipment.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Nouvelle vente" />
      <SaleForm customers={customers} equipment={equipment} />
    </div>
  );
}
