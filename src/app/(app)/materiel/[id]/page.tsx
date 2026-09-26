import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { EquipmentForm } from "../equipment-form";
import { updateEquipment } from "../actions";
import { EquipmentStatusSelect } from "../equipment-status-select";

export default async function EquipmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [equipment, suppliers, categories] = await Promise.all([
    prisma.equipment.findUnique({
      where: { id },
      include: { matches: { include: { request: { include: { customer: true } } } } },
    }),
    prisma.supplier.findMany({
      select: { id: true, companyName: true },
      orderBy: { companyName: "asc" },
    }),
    prisma.equipmentCategory.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!equipment) notFound();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <PageHeader title={equipment.name} />
        <EquipmentStatusSelect equipmentId={id} value={equipment.status} />
      </div>

      <EquipmentForm
        action={updateEquipment.bind(null, id)}
        suppliers={suppliers}
        categories={categories}
        defaultValues={equipment}
        submitLabel="Enregistrer"
      />

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-zinc-900">
          Demandes associées ({equipment.matches.length})
        </h2>
        <ul className="flex flex-col gap-1">
          {equipment.matches.map((match) => (
            <li key={match.id} className="flex items-center gap-2 text-sm">
              <Link href={`/demandes/${match.requestId}`} className="text-zinc-900 hover:underline">
                {match.request.title}
              </Link>
              <span className="text-zinc-500">
                ({match.request.customer.companyName}) — score {match.matchScore}%
              </span>
            </li>
          ))}
          {equipment.matches.length === 0 && (
            <p className="text-sm text-zinc-400">Aucune demande associée.</p>
          )}
        </ul>
      </section>
    </div>
  );
}
