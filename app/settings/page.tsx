import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import SettingsForm from "@/components/settings-form";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/settings");
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, nickname: true, avatar: true, bio: true, email: true, username: true },
  });
  if (!user) redirect("/login");
  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-4 text-2xl font-bold">个人设置</h1>
      <SettingsForm user={user} />
    </div>
  );
}

