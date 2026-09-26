import { PageHeader } from "@/components/page-header";
import { ExpenseForm } from "../expense-form";

export default function NewExpensePage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Nouvelle dépense" />
      <ExpenseForm />
    </div>
  );
}
