export type ParsedLineItem = {
  equipmentId: string | null;
  description: string;
  quantity: number;
  unitPriceHt: number;
  unitCostHt: number;
  vatRate: number;
};

/**
 * Rebuilds line-item rows from parallel `name="field[]"` form arrays
 * (dynamic add/remove rows can't be reliably indexed any other way
 * with plain HTML forms).
 */
export function parseLineItems(formData: FormData): ParsedLineItem[] {
  const descriptions = formData.getAll("description[]").map(String);
  const equipmentIds = formData.getAll("equipmentId[]").map(String);
  const quantities = formData.getAll("quantity[]").map(String);
  const unitPrices = formData.getAll("unitPriceHt[]").map(String);
  const unitCosts = formData.getAll("unitCostHt[]").map(String);
  const vatRates = formData.getAll("vatRate[]").map(String);

  const items: ParsedLineItem[] = [];
  for (let i = 0; i < descriptions.length; i++) {
    if (!descriptions[i]) continue;
    items.push({
      equipmentId: equipmentIds[i] || null,
      description: descriptions[i],
      quantity: Number(quantities[i] || 1),
      unitPriceHt: Number(unitPrices[i] || 0),
      unitCostHt: Number(unitCosts[i] || 0),
      vatRate: Number(vatRates[i] || 20),
    });
  }
  return items;
}

export function computeTotals(items: ParsedLineItem[]) {
  let totalHt = 0;
  let totalTva = 0;
  let totalCostHt = 0;
  for (const item of items) {
    const lineHt = item.quantity * item.unitPriceHt;
    totalHt += lineHt;
    totalTva += (lineHt * item.vatRate) / 100;
    totalCostHt += item.quantity * item.unitCostHt;
  }
  return {
    totalHt,
    totalTva,
    totalTtc: totalHt + totalTva,
    totalCostHt,
    marginHt: totalHt - totalCostHt,
  };
}
