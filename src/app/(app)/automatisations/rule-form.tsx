"use client";

import { useActionState } from "react";
import { createRule } from "./actions";

export function RuleForm({
  users,
}: {
  users: { id: string; firstName: string; lastName: string }[];
}) {
  const [message, formAction, isPending] = useActionState(createRule, undefined);

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-zinc-700">Nom de la règle</label>
        <input
          name="name"
          required
          placeholder="Relance facture en retard"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-zinc-700">Déclencheur</label>
          <select
            name="triggerEntity"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
          >
            <option value="invoice">Facture</option>
            <option value="quote">Devis</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-zinc-700">Événement</label>
          <input
            name="triggerEvent"
            defaultValue="status_changed"
            readOnly
            className="rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-500"
          />
        </div>
      </div>

      <p className="text-xs text-zinc-500">
        Condition : SI le champ… du statut vaut la valeur suivante, ALORS créer une tâche.
      </p>

      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-zinc-700">Champ</label>
          <input
            name="conditionField"
            defaultValue="status"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-zinc-700">Opérateur</label>
          <select
            name="conditionOperator"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
          >
            <option value="eq">est égal à</option>
            <option value="neq">est différent de</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-zinc-700">Valeur</label>
          <input
            name="conditionValue"
            required
            placeholder="EN_RETARD"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-zinc-700">Titre de la tâche à créer</label>
        <input
          name="actionTitle"
          required
          placeholder="Relancer le client"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-zinc-700">Assigner à</label>
        <select
          name="actionAssigneeId"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
        >
          <option value="">—</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.firstName} {u.lastName}
            </option>
          ))}
        </select>
      </div>

      {message && <p className="text-sm text-red-600">{message}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="mt-2 w-fit rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-60"
      >
        {isPending ? "Création…" : "Créer la règle"}
      </button>
    </form>
  );
}
