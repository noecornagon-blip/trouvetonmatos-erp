"use client";

import { useTransition } from "react";

export function EnumSelect<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => Promise<void>;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      defaultValue={value}
      disabled={isPending}
      onChange={(e) =>
        startTransition(() => {
          onChange(e.target.value as T);
        })
      }
      className="rounded-md border border-zinc-300 px-2 py-1 text-sm outline-none focus:border-zinc-900 disabled:opacity-60"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
