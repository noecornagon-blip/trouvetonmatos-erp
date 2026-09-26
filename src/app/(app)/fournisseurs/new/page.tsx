import { PageHeader } from "@/components/page-header";
import { SupplierForm } from "../supplier-form";
import { createSupplier } from "../actions";

export default function NewSupplierPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Nouveau fournisseur" />
      <SupplierForm action={createSupplier} submitLabel="Créer le fournisseur" />
    </div>
  );
}
