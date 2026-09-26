import { ROLES, type RoleName } from "@/lib/roles";

export type Module =
  | "clients"
  | "fournisseurs"
  | "demandes"
  | "materiel"
  | "devis"
  | "ventes"
  | "achats"
  | "factures"
  | "tresorerie"
  | "taches"
  | "documents"
  | "reseaux_sociaux"
  | "automatisations";

const FULL_ACCESS: Module[] = [
  "clients",
  "fournisseurs",
  "demandes",
  "materiel",
  "devis",
  "ventes",
  "achats",
  "factures",
  "tresorerie",
  "taches",
  "documents",
  "reseaux_sociaux",
  "automatisations",
];

const WRITE_MATRIX: Record<RoleName, Module[]> = {
  [ROLES.ADMINISTRATEUR]: FULL_ACCESS,
  [ROLES.ASSOCIE]: FULL_ACCESS,
  [ROLES.COMMERCIAL]: [
    "clients",
    "demandes",
    "devis",
    "ventes",
    "taches",
    "documents",
    "reseaux_sociaux",
  ],
  [ROLES.ACHETEUR]: ["fournisseurs", "materiel", "achats", "taches", "documents"],
  [ROLES.COMPTABILITE]: ["factures", "tresorerie", "taches", "documents"],
  [ROLES.LECTURE_SEULE]: [],
};

export function canWrite(role: string, module: Module): boolean {
  return WRITE_MATRIX[role as RoleName]?.includes(module) ?? false;
}
