"use client";

import { useState } from "react";

export type LineItemRow = {
  key: string;
  equipmentId?: string;
  description?: string;
  quantity?: number;
  unitPriceHt?: number;
  unitCostHt?: number;
  vatRate?: number;
};

export function LineItemsEditor({
  equipment,
  defaultItems,
  unitPriceLabel = "PU HT (€)",
  showCost = false,
}: {
  equipment: { id: string; name: string }[];
  defaultItems?: LineItemRow[];
  unitPriceLabel?: string;
  showCost?: boolean;
}) {
  const [rows, setRows] = useState<LineItemRow[]>(
    defaultItems && defaultItems.length > 0
      ? defaultItems
      : [{ key: crypto.randomUUID() }]
  );

  function addRow() {
    setRows((r) => [...r, { key: crypto.randomUUID() }]);
  }

  function removeRow(key: string) {
    setRows((r) => (r.length > 1 ? r.filter((row) => row.key !== key) : r));
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-zinc-700">Lignes</label>
      <div className="flex flex-col gap-2">
        {rows.map((row) => (
          <div
            key={row.key}
            className={`grid items-center gap-2 rounded-md border border-zinc-200 p-2 ${
              showCost
                ? "grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_auto]"
                : "grid-cols-[2fr_1fr_1fr_1fr_1fr_auto]"
            }`}
          >
            <select
              name="equipmentId[]"
              defaultValue={row.equipmentId ?? ""}
              className="rounded-md border border-zinc-300 px-2 py-1 text-sm"
            >
              <option value="">Matériel (optionnel)</option>
              {equipment.map((eq) => (
                <option key={eq.id} value={eq.id}>
                  {eq.name}
                </option>
              ))}
            </select>
            <input
              name="description[]"
              placeholder="Description"
              defaultValue={row.description ?? ""}
              required
              className="rounded-md border border-zinc-300 px-2 py-1 text-sm"
            />
            <input
              name="quantity[]"
              type="number"
              min={1}
              step={1}
              placeholder="Qté"
              defaultValue={row.quantity ?? 1}
              className="rounded-md border border-zinc-300 px-2 py-1 text-sm"
            />
            <input
              name="unitPriceHt[]"
              type="number"
              step="0.01"
              placeholder={unitPriceLabel}
              defaultValue={row.unitPriceHt ?? ""}
              className="rounded-md border border-zinc-300 px-2 py-1 text-sm"
            />
            {showCost && (
              <input
                name="unitCostHt[]"
                type="number"
                step="0.01"
                placeholder="Coût HT (€)"
                defaultValue={row.unitCostHt ?? ""}
                className="rounded-md border border-zinc-300 px-2 py-1 text-sm"
              />
            )}
            <input
              name="vatRate[]"
              type="number"
              step="0.1"
              placeholder="TVA %"
              defaultValue={row.vatRate ?? 20}
              className="rounded-md border border-zinc-300 px-2 py-1 text-sm"
            />
            <button
              type="button"
              onClick={() => removeRow(row.key)}
              className="text-sm text-red-600 hover:underline"
            >
              Retirer
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={addRow}
        className="w-fit rounded-md border border-zinc-300 px-3 py-1 text-sm hover:bg-zinc-100"
      >
        + Ajouter une ligne
      </button>
    </div>
  );
}
