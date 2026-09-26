import { PageHeader } from "@/components/page-header";
import { SocialPostForm } from "../social-post-form";

export default function NewSocialPostPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Nouveau post" />
      <SocialPostForm />
    </div>
  );
}
