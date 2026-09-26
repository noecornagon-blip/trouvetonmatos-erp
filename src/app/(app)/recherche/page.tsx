import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";

export default async function RecherchePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  const results =
    query.length === 0
      ? null
      : await Promise.all([
          prisma.customer.findMany({
            where: { companyName: { contains: query, mode: "insensitive" } },
            take: 10,
          }),
          prisma.supplier.findMany({
            where: { companyName: { contains: query, mode: "insensitive" } },
            take: 10,
          }),
          prisma.equipment.findMany({
            where: { name: { contains: query, mode: "insensitive" } },
            take: 10,
          }),
          prisma.quote.findMany({
            where: { number: { contains: query, mode: "insensitive" } },
            take: 10,
          }),
          prisma.invoice.findMany({
            where: { number: { contains: query, mode: "insensitive" } },
            take: 10,
          }),
        ]);

  const [customers, suppliers, equipment, quotes, invoices] = results ?? [[], [], [], [], []];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={`Recherche${query ? ` : "${query}"` : ""}`} />

      <form action="/recherche" method="GET" className="max-w-xl">
        <input
          name="q"
          defaultValue={query}
          placeholder="Rechercher un client, fournisseur, matériel, devis, facture…"
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
        />
      </form>

      {query.length === 0 ? (
        <p className="text-sm text-zinc-400">Saisissez un terme de recherche.</p>
      ) : (
        <div className="flex flex-col gap-6">
          <ResultSection title="Clients / prospects">
            {customers.map((c) => (
              <ResultRow key={c.id} href={`/clients/${c.id}`} label={c.companyName} />
            ))}
          </ResultSection>
          <ResultSection title="Fournisseurs">
            {suppliers.map((s) => (
              <ResultRow key={s.id} href={`/fournisseurs/${s.id}`} label={s.companyName} />
            ))}
          </ResultSection>
          <ResultSection title="Matériel">
            {equipment.map((e) => (
              <ResultRow key={e.id} href={`/materiel/${e.id}`} label={e.name} />
            ))}
          </ResultSection>
          <ResultSection title="Devis">
            {quotes.map((q) => (
              <ResultRow key={q.id} href={`/devis/${q.id}`} label={q.number} />
            ))}
          </ResultSection>
          <ResultSection title="Factures">
            {invoices.map((i) => (
              <ResultRow key={i.id} href={`/factures/${i.id}`} label={i.number} />
            ))}
          </ResultSection>
        </div>
      )}
    </div>
  );
}

function ResultSection({ title, children }: { title: string; children: React.ReactNode }) {
  const hasChildren = Array.isArray(children) ? children.length > 0 : !!children;
  if (!hasChildren) return null;
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{title}</h2>
      <ul className="flex flex-col gap-1">{children}</ul>
    </section>
  );
}

function ResultRow({ href, label }: { href: string; label: string }) {
  return (
    <li>
      <Link href={href} className="text-sm text-zinc-900 hover:underline">
        {label}
      </Link>
    </li>
  );
}
