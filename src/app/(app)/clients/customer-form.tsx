"use client";

import { useActionState } from "react";
import type { Customer } from "@/generated/prisma/client";

export function CustomerForm({
  action,
  defaultValues,
  submitLabel,
}: {
  action: (
    prevState: string | undefined,
    formData: FormData
  ) => Promise<string | undefined>;
  defaultValues?: Partial<Customer>;
  submitLabel: string;
}) {
  const [message, formAction, isPending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <Field
          label="Raison sociale"
          name="companyName"
          required
          defaultValue={defaultValues?.companyName}
        />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-zinc-700">Type</label>
          <select
            name="type"
            defaultValue={defaultValues?.type ?? "PROSPECT"}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
          >
            <option value="PROSPECT">Prospect</option>
            <option value="CUSTOMER">Client</option>
          </select>
        </div>
      </div>
      <Field label="SIRET" name="siret" defaultValue={defaultValues?.siret ?? ""} />
      <div className="grid grid-cols-2 gap-4">
        <Field label="Adresse" name="address" defaultValue={defaultValues?.address ?? ""} />
        <Field label="Ville" name="city" defaultValue={defaultValues?.city ?? ""} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Code postal" name="postalCode" defaultValue={defaultValues?.postalCode ?? ""} />
        <Field label="Téléphone" name="phone" defaultValue={defaultValues?.phone ?? ""} />
      </div>
      <Field label="Email" name="email" type="email" defaultValue={defaultValues?.email ?? ""} />
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-zinc-700">Notes</label>
        <textarea
          name="notes"
          defaultValue={defaultValues?.notes ?? ""}
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
