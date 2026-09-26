import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Sidebar } from "@/components/sidebar";
import { SignOutButton } from "@/components/sign-out-button";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-1">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-3">
          <div className="text-sm text-zinc-500">
            Connecté en tant que{" "}
            <span className="font-medium text-zinc-900">
              {session.user.name}
            </span>{" "}
            — {session.user.role}
          </div>
          <SignOutButton />
        </header>
        <main className="flex-1 bg-zinc-50 p-6">{children}</main>
      </div>
    </div>
  );
}
