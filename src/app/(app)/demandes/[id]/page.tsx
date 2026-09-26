import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/badge";
import { RequestControls } from "../request-controls";
import { createMatch } from "../actions";

export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [request, equipment] = await Promise.all([
    prisma.request.findUnique({
      where: { id },
      include: {
        customer: true,
        matches: { include: { equipment: true }, orderBy: { matchScore: "desc" } },
        tasks: true,
      },
    }),
    prisma.equipment.findMany({
      select: { id: true, name: true, brand: true, model: true },
      orderBy: { name: "asc" },
    }),
  ]);
  if (!request) notFound();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <PageHeader title={request.title} />
        <RequestControls
          requestId={id}
          status={request.status}
          priority={request.priority}
        />
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-4 text-sm">
        <p>
          Client :{" "}
          <Link href={`/clients/${request.customerId}`} className="font-medium text-zinc-900 hover:underline">
            {request.customer.companyName}
          </Link>
        </p>
        {request.description && (
          <p className="mt-2 text-zinc-600">{request.description}</p>
        )}
        {request.criteria != null && (
          <p className="mt-2 text-zinc-500">
            Critères : {JSON.stringify(request.criteria)}
          </p>
        )}
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-zinc-900">
          Correspondances matériel
        </h2>
        <ul className="flex flex-col gap-2">
          {request.matches.map((match) => (
            <li
              key={match.id}
              className="flex items-center justify-between rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm"
            >
              <Link href={`/materiel/${match.equipmentId}`} className="font-medium text-zinc-900 hover:underline">
                {match.equipment.name} {match.equipment.brand}
              </Link>
              <span className="text-zinc-500">Score : {match.matchScore}%</span>
            </li>
          ))}
          {request.matches.length === 0 && (
            <p className="text-sm text-zinc-400">Aucune correspondance pour le moment.</p>
          )}
        </ul>

        <form
          action={createMatch.bind(null, id)}
          className="flex max-w-xl flex-wrap items-end gap-2 rounded-md border border-dashed border-zinc-300 p-3"
        >
          <div className="flex flex-col gap-1">
            <label className="text-xs text-zinc-500">Matériel</label>
            <select
              name="equipmentId"
              required
              className="rounded-md border border-zinc-300 px-2 py-1 text-sm"
            >
              <option value="">Sélectionner…</option>
              {equipment.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name} {e.brand ? `— ${e.brand}` : ""}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-zinc-500">Score (%)</label>
            <input
              name="matchScore"
              type="number"
              min={0}
              max={100}
              defaultValue={80}
              className="w-20 rounded-md border border-zinc-300 px-2 py-1 text-sm"
            />
          </div>
          <button
            type="submit"
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-100"
          >
            Associer
          </button>
        </form>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-zinc-900">
          Tâches liées ({request.tasks.length})
        </h2>
        <ul className="flex flex-col gap-1">
          {request.tasks.map((task) => (
            <li key={task.id} className="flex items-center gap-2 text-sm">
              <Link href="/taches" className="text-zinc-900 hover:underline">
                {task.title}
              </Link>
              <StatusBadge status={task.status} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
