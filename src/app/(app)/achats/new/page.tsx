import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { PurchaseOrderForm } from "../purchase-order-form";

export default async function NewPurchaseOrderPage() {
  const [suppliers, equipment] = await Promise.all([
    prisma.supplier.findMany({
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
      <PageHeader title="Nouveau bon de commande" />
      <PurchaseOrderForm suppliers={suppliers} equipment={equipment} />
    </div>
  );
}
