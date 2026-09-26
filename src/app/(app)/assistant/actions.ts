"use server";

import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/action-guard";

export async function askAssistant(
  _prevState: string | undefined,
  formData: FormData
): Promise<string | undefined> {
  await requireUser();

  const question = String(formData.get("question") ?? "").trim();
  if (!question) return "Posez une question.";

  if (!process.env.ANTHROPIC_API_KEY) {
    return "Assistant IA non configuré : ajoutez ANTHROPIC_API_KEY dans les variables d'environnement du serveur pour l'activer.";
  }

  const [openRequests, unpaidClientInvoices, urgentTasks, sales, bankAccounts] =
    await Promise.all([
      prisma.request.count({
        where: { status: { in: ["NOUVELLE", "EN_RECHERCHE", "PROPOSITION_ENVOYEE"] } },
      }),
      prisma.invoice.findMany({
        where: { type: "CLIENT", status: { in: ["ENVOYEE", "EN_RETARD"] } },
        select: { number: true, totalTtc: true, dueDate: true },
      }),
      prisma.task.findMany({
        where: { status: { not: "TERMINEE" }, priority: { in: ["HAUTE", "URGENTE"] } },
        select: { title: true, dueDate: true },
      }),
      prisma.sale.findMany({
        select: { totalHt: true, marginHt: true, createdAt: true },
      }),
      prisma.bankAccount.findMany({ include: { transactions: true } }),
    ]);

  const treasuryBalance = bankAccounts.reduce((sum, account) => {
    const balance = account.transactions.reduce(
      (s, t) => (t.type === "ENCAISSEMENT" ? s + Number(t.amount) : s - Number(t.amount)),
      Number(account.openingBalance)
    );
    return sum + balance;
  }, 0);

  const snapshot = {
    treasuryBalance,
    openRequests,
    unpaidClientInvoices: unpaidClientInvoices.map((i) => ({
      number: i.number,
      totalTtc: Number(i.totalTtc),
      dueDate: i.dueDate,
    })),
    urgentTasks,
    totalSalesHt: sales.reduce((s, sale) => s + Number(sale.totalHt), 0),
    totalMarginHt: sales.reduce((s, sale) => s + Number(sale.marginHt), 0),
    salesCount: sales.length,
  };

  const client = new Anthropic();

  try {
    const response = await client.messages.create({
      model: "claude-opus-5",
      max_tokens: 1024,
      system:
        "Tu es l'assistant interne de TrouveTonMatos, une entreprise de sourcing/trading de matériel agricole et industriel. " +
        "Réponds en français, de façon concise et factuelle, en te basant uniquement sur les données ci-dessous. " +
        "Si la question ne peut pas être répondue avec ces données, dis-le clairement.\n\n" +
        `Données actuelles (JSON) :\n${JSON.stringify(snapshot, null, 2)}`,
      messages: [{ role: "user", content: question }],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    return textBlock?.text ?? "Aucune réponse générée.";
  } catch {
    return "Erreur lors de l'appel à l'assistant IA. Vérifiez la configuration (ANTHROPIC_API_KEY) et réessayez.";
  }
}
