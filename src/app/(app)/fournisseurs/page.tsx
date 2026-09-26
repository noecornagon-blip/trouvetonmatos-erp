import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";

export default async function FournisseursPage() {
  const suppliers = await prisma.supplier.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Fournisseurs"
        action={{ href: "/fournisseurs/new", label: "Nouveau fournisseur" }}
      />

      <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="px-4 py-3">Entreprise</th>
              <th className="px-4 py-3">Ville</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Téléphone</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {suppliers.map((supplier) => (
              <tr key={supplier.id} className="hover:bg-zinc-50">
                <td className="px-4 py-3 font-medium text-zinc-900">
                  <Link href={`/fournisseurs/${supplier.id}`}>
                    {supplier.companyName}
                  </Link>
                </td>
                <td className="px-4 py-3 text-zinc-600">{supplier.city}</td>
                <td className="px-4 py-3 text-zinc-600">
                  {supplier.email ?? "—"}
                </td>
                <td className="px-4 py-3 text-zinc-600">
                  {supplier.phone ?? "—"}
                </td>
              </tr>
            ))}
            {suppliers.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-zinc-400">
                  Aucun fournisseur pour le moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
