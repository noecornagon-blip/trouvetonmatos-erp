import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/badge";

export default async function MaterielPage() {
  const equipment = await prisma.equipment.findMany({
    orderBy: { createdAt: "desc" },
    include: { category: true, supplier: true },
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Matériel"
        action={{ href: "/materiel/new", label: "Nouveau matériel" }}
      />

      <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">Catégorie</th>
              <th className="px-4 py-3">Fournisseur</th>
              <th className="px-4 py-3">Prix HT</th>
              <th className="px-4 py-3">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {equipment.map((item) => (
              <tr key={item.id} className="hover:bg-zinc-50">
                <td className="px-4 py-3 font-medium text-zinc-900">
                  <Link href={`/materiel/${item.id}`}>
                    {item.name} {item.brand ? `— ${item.brand}` : ""}
                  </Link>
                </td>
                <td className="px-4 py-3 text-zinc-600">{item.category?.name ?? "—"}</td>
                <td className="px-4 py-3 text-zinc-600">{item.supplier?.companyName ?? "—"}</td>
                <td className="px-4 py-3 text-zinc-600">
                  {item.priceHt ? `${Number(item.priceHt).toLocaleString("fr-FR")} €` : "—"}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={item.status} />
                </td>
              </tr>
            ))}
            {equipment.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-zinc-400">
                  Aucun matériel pour le moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
