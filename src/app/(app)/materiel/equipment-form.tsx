"use client";

import { useActionState } from "react";
import type { Equipment } from "@/generated/prisma/client";

export function EquipmentForm({
  action,
  suppliers,
  categories,
  defaultValues,
  submitLabel,
}: {
  action: (
    prevState: string | undefined,
    formData: FormData
  ) => Promise<string | undefined>;
  suppliers: { id: string; companyName: string }[];
  categories: { id: string; name: string }[];
  defaultValues?: Partial<Equipment>;
  submitLabel: string;
}) {
  const [message, formAction, isPending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-4">
      <Field label="Nom" name="name" required defaultValue={defaultValues?.name} />
      <div className="grid grid-cols-2 gap-4">
        <Field label="Marque" name="brand" defaultValue={defaultValues?.brand ?? ""} />
        <Field label="Modèle" name="model" defaultValue={defaultValues?.model ?? ""} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field
          label="Année"
          name="year"
          type="number"
          defaultValue={defaultValues?.year?.toString() ?? ""}
        />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-zinc-700">État</label>
          <select
            name="condition"
            defaultValue={defaultValues?.condition ?? "OCCASION"}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
          >
            <option value="NEUF">Neuf</option>
            <option value="OCCASION">Occasion</option>
            <option value="RECONDITIONNE">Reconditionné</option>
          </select>
        </div>
      </div>
      <Field
        label="Prix HT (€)"
        name="priceHt"
        type="number"
        defaultValue={defaultValues?.priceHt?.toString() ?? ""}
      />
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-zinc-700">Fournisseur</label>
          <select
            name="supplierId"
            defaultValue={defaultValues?.supplierId ?? ""}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
          >
            <option value="">—</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.companyName}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-zinc-700">Catégorie</label>
          <select
            name="categoryId"
            defaultValue={defaultValues?.categoryId ?? ""}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
          >
            <option value="">—</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <Field label="Localisation" name="location" defaultValue={defaultValues?.location ?? ""} />
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-zinc-700">Description</label>
        <textarea
          name="description"
          defaultValue={defaultValues?.description ?? ""}
          rows={3}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
        />
      </div>

      {message && <p className="text-sm text-zinc-600">{message}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="mt-2 w-fit rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-60"
      >
        {isPending ? "Enregistrement…" : submitLabel}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string | null;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-sm font-medium text-zinc-700">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue ?? ""}
        className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
      />
    </div>
  );
}
