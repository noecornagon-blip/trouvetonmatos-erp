import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { SocialPostStatusSelect } from "./social-post-status-select";

const PLATFORM_LABEL: Record<string, string> = {
  LINKEDIN: "LinkedIn",
  FACEBOOK: "Facebook",
  INSTAGRAM: "Instagram",
  AUTRE: "Autre",
};

export default async function ReseauxSociauxPage() {
  const posts = await prisma.socialPost.findMany({
    orderBy: [{ scheduledAt: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Calendrier éditorial"
        action={{ href: "/reseaux-sociaux/new", label: "Nouveau post" }}
      />

      <div className="flex flex-col gap-3">
        {posts.map((post) => (
          <div key={post.id} className="flex items-start justify-between rounded-lg border border-zinc-200 bg-white p-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                {PLATFORM_LABEL[post.platform]}
                {post.scheduledAt && ` — ${post.scheduledAt.toLocaleString("fr-FR")}`}
              </span>
              <p className="max-w-2xl text-sm text-zinc-900">{post.content}</p>
            </div>
            <SocialPostStatusSelect postId={post.id} value={post.status} />
          </div>
        ))}
        {posts.length === 0 && (
          <p className="text-sm text-zinc-400">Aucun post planifié pour le moment.</p>
        )}
      </div>
    </div>
  );
}
