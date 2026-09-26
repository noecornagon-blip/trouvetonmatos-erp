import Link from "next/link";

export function PageHeader({
  title,
  action,
}: {
  title: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-semibold text-zinc-900">{title}</h1>
      {action && (
        <Link
          href={action.href}
          className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-700"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
