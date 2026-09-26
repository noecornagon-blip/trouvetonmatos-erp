import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { InvoiceForm } from "../invoice-form";
import type { LineItemRow } from "@/components/line-items-editor";
import type { InvoiceType } from "@/generated/prisma/client";

export default async function NewInvoicePage({
  searchParams,
}: {
  searchParams: Promise<{ saleId?: string; purchaseOrderId?: string }>;
}) {
  const { saleId, purchaseOrderId } = await searchParams;

  const [customers, suppliers] = await Promise.all([
    prisma.customer.findMany({
      select: { id: true, companyName: true },
      orderBy: { companyName: "asc" },
    }),
    prisma.supplier.findMany({
      select: { id: true, companyName: true },
      orderBy: { companyName: "asc" },
    }),
  ]);

  let defaultType: InvoiceType = "CLIENT";
  let defaultCustomerId: string | undefined;
  let defaultSupplierId: string | undefined;
  let defaultItems: LineItemRow[] | undefined;

  if (saleId) {
    const sale = await prisma.sale.findUnique({
      where: { id: saleId },
      include: { items: true },
    });
    if (sale) {
      defaultType = "CLIENT";
      defaultCustomerId = sale.customerId;
      defaultItems = sale.items.map((item) => ({
        key: item.id,
        equipmentId: item.equipmentId ?? undefined,
        description: item.description,
        quantity: item.quantity,
        unitPriceHt: Number(item.unitPriceHt),
        vatRate: Number(item.vatRate),
      }));
    }
  } else if (purchaseOrderId) {
    const po = await prisma.purchaseOrder.findUnique({
      where: { id: purchaseOrderId },
      include: { items: true },
    });
    if (po) {
      defaultType = "FOURNISSEUR";
      defaultSupplierId = po.supplierId;
      defaultItems = po.items.map((item) => ({
        key: item.id,
        equipmentId: item.equipmentId ?? undefined,
        description: item.description,
        quantity: item.quantity,
        unitPriceHt: Number(item.unitPriceHt),
        vatRate: Number(item.vatRate),
      }));
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Nouvelle facture" />
      <InvoiceForm
        customers={customers}
        suppliers={suppliers}
        defaultType={defaultType}
        defaultCustomerId={defaultCustomerId}
        defaultSupplierId={defaultSupplierId}
        defaultSaleId={saleId}
        defaultPurchaseOrderId={purchaseOrderId}
        defaultItems={defaultItems}
      />
    </div>
  );
}
