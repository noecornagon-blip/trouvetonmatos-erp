import { PageHeader } from "@/components/page-header";
import { AssistantForm } from "./assistant-form";

export default function AssistantPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Assistant IA" />
      <p className="max-w-2xl text-sm text-zinc-500">
        Posez une question sur vos données (trésorerie, factures, ventes,
        tâches urgentes…). L&apos;assistant répond uniquement à partir des
        données actuelles de l&apos;application.
      </p>
      <AssistantForm />
    </div>
  );
}
