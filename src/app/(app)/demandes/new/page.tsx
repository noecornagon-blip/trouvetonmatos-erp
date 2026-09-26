import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { RequestForm } from "../request-form";

export default async function NewRequestPage() {
  const customers = await prisma.customer.findMany({
    select: { id: true, companyName: true },
    orderBy: { companyName: "asc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Nouvelle demande de matériel" />
      <RequestForm customers={customers} />
    </div>
  );
}
