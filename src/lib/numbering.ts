import { prisma } from "@/lib/prisma";

const PREFIXES = {
  quote: "DEV",
  sale: "VTE",
  purchaseOrder: "ACH",
  invoiceClient: "FAC",
  invoiceSupplier: "FAC-F",
} as const;

type DocumentKind = keyof typeof PREFIXES;

export async function nextDocumentNumber(kind: DocumentKind): Promise<string> {
  const year = new Date().getFullYear();
  const key = `${kind}-${year}`;

  const counter = await prisma.counter.upsert({
    where: { key },
    update: { value: { increment: 1 } },
    create: { key, value: 1 },
  });

  return `${PREFIXES[kind]}-${year}-${String(counter.value).padStart(4, "0")}`;
}
