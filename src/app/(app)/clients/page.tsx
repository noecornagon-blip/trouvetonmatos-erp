import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";

const TYPE_LABEL: Record<string, string> = {
  PROSPECT: "Prospect",
  CUSTOMER: "Client",
};

const STAGE_LABEL: Record<string, string> = {
  PROSPECT: "Prospect",
  CONTACT_ETABLI: "Contact établi",
  BESOIN_IDENTIFIE: "Besoin identifié",
  RECHERCHE_MATERIEL: "Recherche matériel",
  PROPOSITION: "Proposition",
  DEVIS: "Devis",
  NEGOCIATION: "Négociation",
  COMMANDE: "Commande",
  LIVRAISON: "Livraison",
  FACTURATION: "Facturation",
  PAYE: "Payé",
};

export default async function ClientsPage() {
  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Clients & prospects"
        action={{ href: "/clients/new", label: "Nouveau client" }}
      />

      <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="px-4 py-3">Entreprise</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Étape pipeline</th>
              <th className="px-4 py-3">Ville</th>
              <th className="px-4 py-3">Contact</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {customers.map((customer) => (
              <tr key={customer.id} className="hover:bg-zinc-50">
                <td className="px-4 py-3 font-medium text-zinc-900">
                  <Link href={`/clients/${customer.id}`}>
                    {customer.companyName}
                  </Link>
                </td>
                <td className="px-4 py-3 text-zinc-600">
                  {TYPE_LABEL[customer.type]}
                </td>
                <td className="px-4 py-3 text-zinc-600">
                  {STAGE_LABEL[customer.pipelineStage]}
                </td>
                <td className="px-4 py-3 text-zinc-600">{customer.city}</td>
                <td className="px-4 py-3 text-zinc-600">
                  {customer.email ?? "—"}
                </td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-6 text-center text-zinc-400"
                >
                  Aucun client pour le moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
