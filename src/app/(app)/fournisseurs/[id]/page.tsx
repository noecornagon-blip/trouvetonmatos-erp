import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { SupplierForm } from "../supplier-form";
import { updateSupplier, addSupplierContact } from "../actions";

export default async function SupplierDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supplier = await prisma.supplier.findUnique({
    where: { id },
    include: { contacts: true, equipment: true, purchaseOrders: true },
  });
  if (!supplier) notFound();

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title={supplier.companyName} />

      <SupplierForm
        action={updateSupplier.bind(null, id)}
        defaultValues={supplier}
        submitLabel="Enregistrer"
      />

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-zinc-900">Contacts</h2>
        <ul className="flex flex-col gap-2">
          {supplier.contacts.map((contact) => (
            <li
              key={contact.id}
              className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm"
            >
              <span className="font-medium text-zinc-900">
                {contact.firstName} {contact.lastName}
              </span>{" "}
              {contact.role && (
                <span className="text-zinc-500">— {contact.role}</span>
              )}
              <div className="text-zinc-500">
                {contact.email} {contact.phone}
              </div>
            </li>
          ))}
          {supplier.contacts.length === 0 && (
            <p className="text-sm text-zinc-400">Aucun contact.</p>
          )}
        </ul>

        <form
          action={addSupplierContact.bind(null, id)}
          className="flex max-w-xl flex-wrap items-end gap-2 rounded-md border border-dashed border-zinc-300 p-3"
        >
          <MiniField label="Prénom" name="firstName" />
          <MiniField label="Nom" name="lastName" />
          <MiniField label="Fonction" name="role" />
          <MiniField label="Email" name="email" type="email" />
          <MiniField label="Téléphone" name="phone" />
          <button
            type="submit"
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-100"
          >
            Ajouter
          </button>
        </form>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-zinc-900">
          Matériel proposé ({supplier.equipment.length})
        </h2>
        <h2 className="text-sm font-semibold text-zinc-900">
          Bons de commande ({supplier.purchaseOrders.length})
        </h2>
      </section>
    </div>
  );
}

function MiniField({
  label,
  name,
  type = "text",
}: {
  label: string;
  name: string;
  type?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-zinc-500">{label}</label>
      <input
        name={name}
        type={type}
        className="rounded-md border border-zinc-300 px-2 py-1 text-sm outline-none focus:border-zinc-900"
      />
    </div>
  );
}
