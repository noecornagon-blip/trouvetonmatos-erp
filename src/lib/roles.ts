export const ROLES = {
  ADMINISTRATEUR: "Administrateur",
  ASSOCIE: "Associé",
  COMMERCIAL: "Commercial",
  ACHETEUR: "Acheteur",
  COMPTABILITE: "Comptabilité",
  LECTURE_SEULE: "Lecture seule",
} as const;

export type RoleName = (typeof ROLES)[keyof typeof ROLES];

export function hasRole(userRole: string, allowed: RoleName[]) {
  return allowed.includes(userRole as RoleName);
}
