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

## Déploiement en ligne (Vercel)

1. Cliquez sur ce lien pour importer le dépôt dans Vercel (connexion avec votre compte GitHub) :
   [Déployer sur Vercel](https://vercel.com/new/clone?repository-url=https://github.com/noecornagon-blip/trouvetonmatos-erp)
2. Pendant l'import, ajoutez une base de données Postgres : dans l'écran de configuration du projet, section **Storage**, ajoutez **Postgres** (Neon) — Vercel remplit automatiquement `DATABASE_URL`.
3. Ajoutez les variables d'environnement restantes (section **Environment Variables**) :
   - `NEXTAUTH_SECRET` : générez-en un avec `openssl rand -base64 32`
   - `ANTHROPIC_API_KEY` (optionnel, pour l'assistant IA)
4. Déployez. Le build applique automatiquement les migrations (`prisma migrate deploy`) — la base sera créée mais vide.
5. Une fois déployé, chargez les données de démonstration en exécutant une fois, depuis votre machine ou ce projet, avec `DATABASE_URL` pointant vers la base de production :
   ```bash
   npx prisma db seed
   ```

Les déploiements suivants se font automatiquement à chaque `git push` sur `main`.

> Note : le module Documents stocke les fichiers sur le disque du serveur, qui n'est pas persistant sur Vercel (environnement serverless). L'upload y affichera un message d'erreur explicite tant qu'un stockage externe (ex: Vercel Blob) n'est pas configuré.
