import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { UploadForm } from "./upload-form";

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export default async function DocumentsPage() {
  const documents = await prisma.document.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Documents" />

      <UploadForm />

      <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="px-4 py-3">Fichier</th>
              <th className="px-4 py-3">Catégorie</th>
              <th className="px-4 py-3">Taille</th>
              <th className="px-4 py-3">Ajouté le</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {documents.map((doc) => (
              <tr key={doc.id}>
                <td className="px-4 py-3">
                  <Link
                    href={doc.path}
                    target="_blank"
                    className="font-medium text-zinc-900 hover:underline"
                  >
                    {doc.filename}
                  </Link>
                </td>
                <td className="px-4 py-3 text-zinc-600">{doc.entityType}</td>
                <td className="px-4 py-3 text-zinc-600">{formatSize(doc.size)}</td>
                <td className="px-4 py-3 text-zinc-600">
                  {doc.createdAt.toLocaleDateString("fr-FR")}
                </td>
              </tr>
            ))}
            {documents.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-zinc-400">
                  Aucun document pour le moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
