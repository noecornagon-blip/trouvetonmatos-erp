import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { RuleForm } from "../rule-form";

export default async function NewRulePage() {
  const users = await prisma.user.findMany({
    where: { active: true },
    select: { id: true, firstName: true, lastName: true },
    orderBy: { firstName: "asc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Nouvelle règle d'automatisation" />
      <RuleForm users={users} />
    </div>
  );
}
