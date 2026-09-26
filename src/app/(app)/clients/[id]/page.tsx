import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/badge";
import { CustomerForm } from "../customer-form";
import { updateCustomer, addCustomerContact } from "../actions";
import { PipelineStageSelect } from "../pipeline-stage-select";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      contacts: true,
      requests: true,
      quotes: { orderBy: { createdAt: "desc" } },
      sales: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!customer) notFound();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <PageHeader title={customer.companyName} />
        <PipelineStageSelect customerId={id} value={customer.pipelineStage} />
      </div>

      <CustomerForm
        action={updateCustomer.bind(null, id)}
        defaultValues={customer}
        submitLabel="Enregistrer"
      />

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-zinc-900">Contacts</h2>
        <ul className="flex flex-col gap-2">
          {customer.contacts.map((contact) => (
            <li
              key={contact.id}
              className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm"
            >
              <span className="font-medium text-zinc-900">
                {contact.firstName} {contact.lastName}
              </span>{" "}
              {contact.role && <span className="text-zinc-500">— {contact.role}</span>}
              <div className="text-zinc-500">
                {contact.email} {contact.phone}
              </div>
            </li>
          ))}
          {customer.contacts.length === 0 && (
            <p className="text-sm text-zinc-400">Aucun contact.</p>
          )}
        </ul>

        <form
          action={addCustomerContact.bind(null, id)}
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
          Demandes de matériel ({customer.requests.length})
        </h2>
        <ul className="flex flex-col gap-1">
          {customer.requests.map((request) => (
            <li key={request.id} className="flex items-center gap-2 text-sm">
              <Link href={`/demandes/${request.id}`} className="text-zinc-900 hover:underline">
                {request.title}
              </Link>
              <StatusBadge status={request.status} />
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-zinc-900">
          Devis ({customer.quotes.length})
        </h2>
        <ul className="flex flex-col gap-1">
          {customer.quotes.map((quote) => (
            <li key={quote.id} className="flex items-center gap-2 text-sm">
              <Link href={`/devis/${quote.id}`} className="text-zinc-900 hover:underline">
                {quote.number}
              </Link>
              <StatusBadge status={quote.status} />
              <span className="text-zinc-500">
                {Number(quote.totalTtc).toLocaleString("fr-FR")} € TTC
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-zinc-900">
          Ventes ({customer.sales.length})
        </h2>
        <ul className="flex flex-col gap-1">
          {customer.sales.map((sale) => (
            <li key={sale.id} className="flex items-center gap-2 text-sm">
              <Link href={`/ventes/${sale.id}`} className="text-zinc-900 hover:underline">
                {sale.number}
              </Link>
              <StatusBadge status={sale.status} />
              <span className="text-zinc-500">
                {Number(sale.totalTtc).toLocaleString("fr-FR")} € TTC
              </span>
            </li>
          ))}
        </ul>
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
