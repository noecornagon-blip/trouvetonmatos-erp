import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const DEV_PASSWORD = "ChangeMe123!";

const ROLES = [
  { name: "Administrateur", description: "Accès total, paramètres entreprise, gestion des utilisateurs et des rôles" },
  { name: "Associé", description: "Accès total aux données métier (CRM à trésorerie), vue direction" },
  { name: "Commercial", description: "Clients, prospects, demandes matériel, devis, ventes ; lecture seule sur achats et trésorerie" },
  { name: "Acheteur", description: "Fournisseurs, recherche matériel, achats ; lecture seule sur ventes" },
  { name: "Comptabilité", description: "Factures, trésorerie, TVA, comptabilité, dépenses ; lecture seule sur ventes/achats" },
  { name: "Lecture seule", description: "Consultation de tous les modules autorisés, aucune écriture" },
];

async function main() {
  console.log("Seeding database avec des données de démonstration fictives…");

  const passwordHash = await bcrypt.hash(DEV_PASSWORD, 10);

  await prisma.company.upsert({
    where: { id: "company-trouvetonmatos" },
    update: {},
    create: {
      id: "company-trouvetonmatos",
      name: "TrouveTonMatos SAS",
      siret: "000000000 00000",
      vatNumber: "FR00 000000000",
      address: "1 rue de l'Exemple",
      city: "Lyon",
      postalCode: "69000",
      country: "France",
      phone: "+33 4 00 00 00 00",
      email: "contact@trouvetonmatos.example",
    },
  });

  const roleByName = new Map<string, string>();
  for (const role of ROLES) {
    const created = await prisma.role.upsert({
      where: { name: role.name },
      update: { description: role.description },
      create: role,
    });
    roleByName.set(role.name, created.id);
  }

  const modules = ["clients", "demandes", "materiel", "devis", "ventes", "achats", "factures", "tresorerie", "taches"];
  const actions = ["READ", "CREATE", "UPDATE", "DELETE", "VALIDATE"] as const;
  const permissionByKey = new Map<string, string>();
  for (const module of modules) {
    for (const action of actions) {
      const permission = await prisma.permission.upsert({
        where: { module_action: { module, action } },
        update: {},
        create: { module, action },
      });
      permissionByKey.set(`${module}:${action}`, permission.id);
    }
  }

  const adminRoleId = roleByName.get("Administrateur")!;
  for (const permissionId of permissionByKey.values()) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: adminRoleId, permissionId } },
      update: {},
      create: { roleId: adminRoleId, permissionId },
    });
  }

  const users = [
    { email: "jean.dupont@trouvetonmatos.fr", firstName: "Jean", lastName: "Dupont", role: "Associé" },
    { email: "marie.lefevre@trouvetonmatos.fr", firstName: "Marie", lastName: "Lefèvre", role: "Associé" },
    { email: "karim.haddad@trouvetonmatos.fr", firstName: "Karim", lastName: "Haddad", role: "Associé" },
    { email: "sophie.moreau@trouvetonmatos.fr", firstName: "Sophie", lastName: "Moreau", role: "Commercial" },
    { email: "thomas.bernard@trouvetonmatos.fr", firstName: "Thomas", lastName: "Bernard", role: "Acheteur" },
    { email: "lucie.girard@trouvetonmatos.fr", firstName: "Lucie", lastName: "Girard", role: "Comptabilité" },
  ];

  const userByEmail = new Map<string, string>();
  for (const u of users) {
    const created = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email,
        passwordHash,
        firstName: u.firstName,
        lastName: u.lastName,
        roleId: roleByName.get(u.role)!,
      },
    });
    userByEmail.set(u.email, created.id);
  }
  const jean = userByEmail.get("jean.dupont@trouvetonmatos.fr")!;
  const sophie = userByEmail.get("sophie.moreau@trouvetonmatos.fr")!;
  const thomas = userByEmail.get("thomas.bernard@trouvetonmatos.fr")!;

  const customerA = await prisma.customer.upsert({
    where: { id: "customer-earl-duval" },
    update: {},
    create: {
      id: "customer-earl-duval",
      type: "CUSTOMER",
      companyName: "EARL Duval Frères",
      siret: "111111111 11111",
      address: "Route de la Ferme",
      city: "Bourg-en-Bresse",
      postalCode: "01000",
      country: "France",
      email: "contact@earl-duval.example",
      phone: "+33 6 11 11 11 11",
      pipelineStage: "COMMANDE",
      createdBy: jean,
    },
  });

  const customerB = await prisma.customer.upsert({
    where: { id: "customer-ferme-moulin-vert" },
    update: {},
    create: {
      id: "customer-ferme-moulin-vert",
      type: "PROSPECT",
      companyName: "Ferme du Moulin Vert",
      address: "Chemin du Moulin",
      city: "Mâcon",
      postalCode: "71000",
      country: "France",
      email: "contact@moulin-vert.example",
      phone: "+33 6 22 22 22 22",
      pipelineStage: "DEVIS",
      createdBy: sophie,
    },
  });

  await prisma.contact.upsert({
    where: { id: "contact-earl-duval-1" },
    update: {},
    create: {
      id: "contact-earl-duval-1",
      firstName: "Pierre",
      lastName: "Duval",
      email: "pierre.duval@earl-duval.example",
      phone: "+33 6 33 33 33 33",
      role: "Gérant",
      customerId: customerA.id,
    },
  });

  const supplierA = await prisma.supplier.upsert({
    where: { id: "supplier-agro-machines-est" },
    update: {},
    create: {
      id: "supplier-agro-machines-est",
      companyName: "Agro Machines Est",
      address: "Zone Industrielle Nord",
      city: "Strasbourg",
      postalCode: "67000",
      country: "France",
      email: "vente@agro-machines-est.example",
      phone: "+33 3 88 00 00 00",
      createdBy: thomas,
    },
  });

  const categoryTracteurs = await prisma.equipmentCategory.upsert({
    where: { id: "category-tracteurs" },
    update: {},
    create: { id: "category-tracteurs", name: "Tracteurs" },
  });

  const equipmentA = await prisma.equipment.upsert({
    where: { id: "equipment-tracteur-1" },
    update: {},
    create: {
      id: "equipment-tracteur-1",
      supplierId: supplierA.id,
      categoryId: categoryTracteurs.id,
      name: "Tracteur agricole 120cv",
      brand: "Fendt",
      model: "312 Vario",
      year: 2019,
      condition: "OCCASION",
      priceHt: 62000,
      description: "Tracteur d'occasion, révisé, 3200 heures.",
      location: "Dépôt Strasbourg",
      status: "DISPONIBLE",
      createdBy: thomas,
    },
  });

  const request = await prisma.request.upsert({
    where: { id: "request-earl-duval-1" },
    update: {},
    create: {
      id: "request-earl-duval-1",
      customerId: customerA.id,
      title: "Recherche tracteur 100-130cv",
      description: "Client cherche un tracteur d'occasion pour l'exploitation, budget 65k€ HT max.",
      criteria: { puissanceMin: 100, puissanceMax: 130, budgetMaxHt: 65000 },
      priority: "HAUTE",
      status: "EN_RECHERCHE",
      createdBy: sophie,
    },
  });

  await prisma.equipmentMatch.upsert({
    where: { requestId_equipmentId: { requestId: request.id, equipmentId: equipmentA.id } },
    update: {},
    create: {
      requestId: request.id,
      equipmentId: equipmentA.id,
      matchScore: 92,
      matchedCriteria: { puissance: true, budget: true },
      unmatchedCriteria: {},
    },
  });

  const quote = await prisma.quote.upsert({
    where: { number: "DEV-2026-0001" },
    update: {},
    create: {
      number: "DEV-2026-0001",
      customerId: customerA.id,
      status: "ACCEPTE",
      validUntil: new Date("2026-10-31"),
      totalHt: 62000,
      totalTva: 12400,
      totalTtc: 74400,
      createdBy: sophie,
      items: {
        create: [
          {
            equipmentId: equipmentA.id,
            description: "Tracteur Fendt 312 Vario, révisé",
            quantity: 1,
            unitPriceHt: 62000,
            vatRate: 20,
          },
        ],
      },
    },
  });

  const sale = await prisma.sale.upsert({
    where: { number: "VTE-2026-0001" },
    update: {},
    create: {
      number: "VTE-2026-0001",
      customerId: customerA.id,
      quoteId: quote.id,
      status: "LIVRAISON",
      totalHt: 62000,
      totalTva: 12400,
      totalTtc: 74400,
      totalCostHt: 48000,
      marginHt: 14000,
      items: {
        create: [
          {
            equipmentId: equipmentA.id,
            description: "Tracteur Fendt 312 Vario, révisé",
            quantity: 1,
            unitPriceHt: 62000,
            unitCostHt: 48000,
            vatRate: 20,
          },
        ],
      },
    },
  });

  const purchaseOrder = await prisma.purchaseOrder.upsert({
    where: { number: "ACH-2026-0001" },
    update: {},
    create: {
      number: "ACH-2026-0001",
      supplierId: supplierA.id,
      status: "RECU",
      transportCost: 800,
      otherFees: 200,
      totalHt: 47000,
      totalTva: 9400,
      totalTtc: 56400,
      createdBy: thomas,
      items: {
        create: [
          {
            equipmentId: equipmentA.id,
            description: "Tracteur Fendt 312 Vario, achat occasion",
            quantity: 1,
            unitPriceHt: 47000,
            vatRate: 20,
          },
        ],
      },
    },
  });

  const clientInvoice = await prisma.invoice.upsert({
    where: { number: "FAC-2026-0001" },
    update: {},
    create: {
      number: "FAC-2026-0001",
      type: "CLIENT",
      status: "PAYEE",
      dueDate: new Date("2026-10-15"),
      saleId: sale.id,
      customerId: customerA.id,
      totalHt: 62000,
      totalTva: 12400,
      totalTtc: 74400,
      createdBy: sophie,
      items: {
        create: [
          {
            description: "Tracteur Fendt 312 Vario, révisé",
            quantity: 1,
            unitPriceHt: 62000,
            vatRate: 20,
          },
        ],
      },
    },
  });

  await prisma.payment.upsert({
    where: { id: "payment-1" },
    update: {},
    create: {
      id: "payment-1",
      invoiceId: clientInvoice.id,
      amount: 74400,
      method: "VIREMENT",
      reference: "VIR-20260920-001",
      createdBy: jean,
    },
  });

  await prisma.invoice.upsert({
    where: { number: "FAC-F-2026-0001" },
    update: {},
    create: {
      number: "FAC-F-2026-0001",
      type: "FOURNISSEUR",
      status: "ENVOYEE",
      dueDate: new Date("2026-10-20"),
      purchaseOrderId: purchaseOrder.id,
      supplierId: supplierA.id,
      totalHt: 47000,
      totalTva: 9400,
      totalTtc: 56400,
      createdBy: thomas,
      items: {
        create: [
          {
            description: "Tracteur Fendt 312 Vario, achat occasion",
            quantity: 1,
            unitPriceHt: 47000,
            vatRate: 20,
          },
        ],
      },
    },
  });

  await prisma.bankAccount.upsert({
    where: { id: "bank-account-1" },
    update: {},
    create: {
      id: "bank-account-1",
      name: "Compte courant principal",
      currency: "EUR",
      openingBalance: 25000,
    },
  });

  await prisma.task.upsert({
    where: { id: "task-1" },
    update: {},
    create: {
      id: "task-1",
      title: "Relancer Ferme du Moulin Vert sur le devis en cours",
      status: "A_FAIRE",
      priority: "NORMALE",
      dueDate: new Date("2026-10-05"),
      assigneeId: sophie,
      entityType: "customer",
      entityId: customerB.id,
      createdBy: sophie,
    },
  });

  await prisma.task.upsert({
    where: { id: "task-2" },
    update: {},
    create: {
      id: "task-2",
      title: "Confirmer réception du tracteur Fendt auprès d'Agro Machines Est",
      status: "TERMINEE",
      priority: "HAUTE",
      assigneeId: thomas,
      entityType: "purchase_order",
      entityId: purchaseOrder.id,
      createdBy: thomas,
    },
  });

  await prisma.activityLog.create({
    data: {
      userId: sophie,
      action: "quote.accepted",
      entityType: "quote",
      entityId: quote.id,
      changes: { status: { from: "ENVOYE", to: "ACCEPTE" } },
    },
  });

  console.log("Seed terminé.");
  console.log(`Comptes de démonstration créés (mot de passe pour tous : "${DEV_PASSWORD}") :`);
  for (const u of users) {
    console.log(`  - ${u.email} (${u.role})`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
