import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PostEditor from "@/components/post/post-editor";

export const dynamic = "force-dynamic";

export default async function NewPostPage({
  searchParams,
}: {
  searchParams: { type?: string };
}) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/post/new");
  const [categories, circles] = await Promise.all([
    prisma.category.findMany({ orderBy: { sort: "asc" } }),
    prisma.circle.findMany({ orderBy: { name: "asc" } }),
  ]);
  const t = searchParams.type;
  const initialType = t === "app" ? "app" : t === "question" ? "question" : t === "service" ? "service" : "text";
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-4 text-2xl font-bold">发布内容</h1>
      <PostEditor categories={categories} circles={circles} initialType={initialType} />
    </div>
  );
}

