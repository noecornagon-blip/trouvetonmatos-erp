# TrouveTonMatos — Cockpit ERP/CRM interne

Application interne de gestion pour TrouveTonMatos (CRM, sourcing, devis,
ventes, achats, factures, trésorerie, et plus). Next.js 16 + Prisma 7 +
PostgreSQL.

## Prérequis

- [Node.js](https://nodejs.org/) 22 ou plus récent
- [PostgreSQL](https://www.postgresql.org/download/) 16 ou plus récent (en local, ou un service comme Neon/Supabase/Railway)
- [Git](https://git-scm.com/)

## Installation

```bash
git clone https://github.com/noecornagon-blip/trouvetonmatos-erp.git
cd trouvetonmatos-erp
npm install
```

## Configuration

Copiez `.env.example` en `.env` et renseignez vos valeurs :

```bash
cp .env.example .env
```

- `DATABASE_URL` : connexion à votre base PostgreSQL
- `NEXTAUTH_SECRET` : générez-en un avec `openssl rand -base64 32`
- `ANTHROPIC_API_KEY` (optionnel) : pour activer la page Assistant IA

Si vous n'avez pas encore de base PostgreSQL locale, créez-la (adaptez les identifiants à ceux mis dans `DATABASE_URL`) :

```bash
createdb trouvetonmatos_erp
```

## Base de données

```bash
npx prisma migrate deploy   # applique le schéma
npx prisma db seed          # crée des comptes et données de démonstration
```

Le seed affiche la liste des comptes créés. Le mot de passe de tous les
comptes de démonstration est `ChangeMe123!` — à changer en production.

## Lancer l'application

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) et connectez-vous avec l'un des comptes affichés par le seed (par exemple `jean.dupont@trouvetonmatos.fr`).

## Build de production

```bash
npm run build
npm run start
```
