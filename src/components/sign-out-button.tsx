"use client";

import { signOutAction } from "@/app/(app)/actions";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOutAction()}
      className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100"
    >
      Se déconnecter
    </button>
  );
}
