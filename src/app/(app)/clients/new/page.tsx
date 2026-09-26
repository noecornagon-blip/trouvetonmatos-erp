import { PageHeader } from "@/components/page-header";
import { CustomerForm } from "../customer-form";
import { createCustomer } from "../actions";

export default function NewCustomerPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Nouveau client / prospect" />
      <CustomerForm action={createCustomer} submitLabel="Créer" />
    </div>
  );
}
