const COLORS: Record<string, string> = {
  gray: "bg-zinc-100 text-zinc-700",
  blue: "bg-blue-100 text-blue-700",
  yellow: "bg-amber-100 text-amber-700",
  green: "bg-emerald-100 text-emerald-700",
  red: "bg-red-100 text-red-700",
  purple: "bg-purple-100 text-purple-700",
};

export function Badge({
  label,
  color = "gray",
}: {
  label: string;
  color?: keyof typeof COLORS;
}) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${COLORS[color]}`}
    >
      {label}
    </span>
  );
}

export const STATUS_COLORS: Record<string, keyof typeof COLORS> = {
  // Générique / demandes / prospection
  PROSPECT: "gray",
  CONTACT_ETABLI: "blue",
  BESOIN_IDENTIFIE: "blue",
  RECHERCHE_MATERIEL: "blue",
  PROPOSITION: "purple",
  DEVIS: "purple",
  NEGOCIATION: "yellow",
  COMMANDE: "blue",
  LIVRAISON: "blue",
  FACTURATION: "purple",
  PAYE: "green",
  PAYEE: "green",
  // Demandes
  NOUVELLE: "gray",
  EN_RECHERCHE: "blue",
  PROPOSITION_ENVOYEE: "purple",
  CONVERTIE: "green",
  ABANDONNEE: "red",
  // Devis / achats / factures génériques
  BROUILLON: "gray",
  ENVOYE: "blue",
  ENVOYEE: "blue",
  ACCEPTE: "green",
  REFUSE: "red",
  EXPIRE: "red",
  RECU: "green",
  FACTURE: "purple",
  ANNULE: "red",
  ANNULEE: "red",
  EN_RETARD: "red",
  VALIDE: "green",
  PLANIFIE: "blue",
  PUBLIE: "green",
  // Tâches
  A_FAIRE: "gray",
  EN_COURS: "blue",
  EN_ATTENTE: "yellow",
  TERMINEE: "green",
  // Priorités
  BASSE: "gray",
  NORMALE: "blue",
  HAUTE: "yellow",
  URGENTE: "red",
  // Équipement
  DISPONIBLE: "green",
  RESERVE: "yellow",
  VENDU: "gray",
  ARCHIVE: "gray",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge
      label={status.replaceAll("_", " ").toLowerCase()}
      color={STATUS_COLORS[status] ?? "gray"}
    />
  );
}
