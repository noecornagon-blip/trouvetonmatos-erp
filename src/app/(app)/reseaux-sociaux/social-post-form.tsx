"use client";

import { useActionState } from "react";
import { createSocialPost } from "./actions";

export function SocialPostForm() {
  const [message, formAction, isPending] = useActionState(createSocialPost, undefined);

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-zinc-700">Plateforme</label>
        <select
          name="platform"
          defaultValue="LINKEDIN"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
        >
          <option value="LINKEDIN">LinkedIn</option>
          <option value="FACEBOOK">Facebook</option>
          <option value="INSTAGRAM">Instagram</option>
          <option value="AUTRE">Autre</option>
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-zinc-700">Contenu</label>
        <textarea
          name="content"
          rows={4}
          required
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-zinc-700">
          Date de publication prévue (optionnel)
        </label>
        <input
          name="scheduledAt"
          type="datetime-local"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
        />
      </div>

      {message && <p className="text-sm text-red-600">{message}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="mt-2 w-fit rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-60"
      >
        {isPending ? "Enregistrement…" : "Créer le post"}
      </button>
    </form>
  );
}
