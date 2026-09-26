"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_GROUPS = [
  {
    label: "Pilotage",
    links: [
      { href: "/dashboard", label: "Dashboard" },
      { href: "/reporting", label: "Reporting" },
      { href: "/assistant", label: "Assistant IA" },
      { href: "/automatisations", label: "Automatisations" },
      { href: "/journal", label: "Journal d'activité" },
    ],
  },
  {
    label: "Commercial",
    links: [
      { href: "/clients", label: "Clients & prospects" },
      { href: "/demandes", label: "Demandes de matériel" },
      { href: "/devis", label: "Devis" },
      { href: "/ventes", label: "Ventes" },
    ],
  },
  {
    label: "Sourcing",
    links: [
      { href: "/materiel", label: "Matériel" },
      { href: "/fournisseurs", label: "Fournisseurs" },
      { href: "/achats", label: "Achats" },
    ],
  },
  {
    label: "Finance",
    links: [
      { href: "/factures", label: "Factures" },
      { href: "/tresorerie", label: "Trésorerie" },
      { href: "/depenses", label: "Dépenses" },
      { href: "/tva", label: "TVA" },
    ],
  },
  {
    label: "Organisation",
    links: [
      { href: "/taches", label: "Tâches" },
      { href: "/documents", label: "Documents" },
      { href: "/reseaux-sociaux", label: "Réseaux sociaux" },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex w-64 shrink-0 flex-col gap-6 border-r border-zinc-200 bg-white px-4 py-6">
      <div className="px-2 text-lg font-semibold text-zinc-900">
        TrouveTonMatos
      </div>
      {NAV_GROUPS.map((group) => (
        <div key={group.label} className="flex flex-col gap-1">
          <span className="px-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">
            {group.label}
          </span>
          {group.links.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-md px-2 py-1.5 text-sm ${
                  isActive
                    ? "bg-zinc-900 text-white"
                    : "text-zinc-600 hover:bg-zinc-100"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
