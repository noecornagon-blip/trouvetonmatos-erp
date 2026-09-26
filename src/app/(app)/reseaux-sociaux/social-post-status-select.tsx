"use client";

import { EnumSelect } from "@/components/enum-select";
import type { SocialPostStatus } from "@/generated/prisma/client";
import { updateSocialPostStatus } from "./actions";

const OPTIONS: { value: SocialPostStatus; label: string }[] = [
  { value: "BROUILLON", label: "Brouillon" },
  { value: "PLANIFIE", label: "Planifié" },
  { value: "PUBLIE", label: "Publié" },
];

export function SocialPostStatusSelect({ postId, value }: { postId: string; value: SocialPostStatus }) {
  return (
    <EnumSelect value={value} options={OPTIONS} onChange={updateSocialPostStatus.bind(null, postId)} />
  );
}
