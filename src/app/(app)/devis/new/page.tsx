import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { QuoteForm } from "../quote-form";

export default async function NewQuotePage() {
  const [customers, requests, equipment] = await Promise.all([
    prisma.customer.findMany({
      select: { id: true, companyName: true },
      orderBy: { companyName: "asc" },
    }),
    prisma.request.findMany({
      select: { id: true, title: true, customerId: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.equipment.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Nouveau devis" />
      <QuoteForm customers={customers} requests={requests} equipment={equipment} />
    </div>
  );
}
