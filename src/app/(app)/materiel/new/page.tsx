import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { EquipmentForm } from "../equipment-form";
import { createEquipment, createCategory } from "../actions";

export default async function NewEquipmentPage() {
  const [suppliers, categories] = await Promise.all([
    prisma.supplier.findMany({
      select: { id: true, companyName: true },
      orderBy: { companyName: "asc" },
    }),
    prisma.equipmentCategory.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Nouveau matériel" />
      <EquipmentForm
        action={createEquipment}
        suppliers={suppliers}
        categories={categories}
        submitLabel="Créer"
      />

      <form
        action={createCategory}
        className="flex max-w-xl items-end gap-2 rounded-md border border-dashed border-zinc-300 p-3"
      >
        <div className="flex flex-col gap-1">
          <label className="text-xs text-zinc-500">Nouvelle catégorie</label>
          <input
            name="name"
            className="rounded-md border border-zinc-300 px-2 py-1 text-sm"
          />
        </div>
        <button
          type="submit"
          className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-100"
        >
          Ajouter
        </button>
      </form>
    </div>
  );
}
