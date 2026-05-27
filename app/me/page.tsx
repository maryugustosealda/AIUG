import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ChevronRight,
  FileText,
  Heart,
  Bookmark,
  UserPlus,
  Settings,
  Shield,
  Plus,
  LogIn,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import MeSignOutButton from "@/components/me-sign-out-button";

export const dynamic = "force-dynamic";

export default async function MePage() {
  const session = await auth();

  if (!session?.user) {
    return (
      <div className="mx-auto max-w-md space-y-6 py-8 text-center">
        <h1 className="text-2xl font-bold">我的</h1>
        <p className="text-sm text-[rgb(var(--muted))]">登录后查看帖子、收藏与设置</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/login?callbackUrl=/me" className="btn-primary">
            <LogIn className="h-4 w-4" /> 登录
          </Link>
          <Link href="/register" className="btn-ghost border border-[rgb(var(--border))]">
            注册账号
          </Link>
        </div>
      </div>
    );
  }

  const u = session.user as {
    id: string;
    email?: string;
    name?: string;
    username?: string;
    nickname?: string;
    avatar?: string;
    image?: string;
    role?: string;
  };

  const [postCount, likeCount, favCount] = await Promise.all([
    prisma.post.count({ where: { authorId: u.id } }),
    prisma.like.count({ where: { userId: u.id } }),
    prisma.favorite.count({ where: { userId: u.id } }),
  ]);

  const avatar = u.avatar || u.image;
  const displayName = u.nickname || u.name || u.username || "用户";

  const links = [
    {
      href: `/u/${u.username}`,
      label: "个人主页",
      desc: "对外展示的主页",
      icon: ChevronRight,
    },
    {
      href: `/u/${u.username}`,
      label: "我的帖子",
      desc: `${postCount} 篇`,
      icon: FileText,
    },
    {
      href: "/me/likes",
      label: "我的点赞",
      desc: `${likeCount} 条`,
      icon: Heart,
    },
    {
      href: "/me/favorites",
      label: "我的收藏",
      desc: `${favCount} 条`,
      icon: Bookmark,
    },
    {
      href: "/settings",
      label: "账号设置",
      icon: Settings,
    },
  ];

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-bold md:hidden">我的</h1>

      <div className="card flex items-center gap-4 p-5">
        {avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatar} alt="" className="h-16 w-16 rounded-full object-cover" />
        ) : (
          <div className="grid h-16 w-16 place-items-center rounded-full bg-brand-100 text-xl font-bold text-brand-700">
            {displayName.slice(0, 1)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-semibold">{displayName}</p>
          <p className="truncate text-sm text-[rgb(var(--muted))]">@{u.username}</p>
        </div>
        <Link href="/post/new" className="btn-primary shrink-0 px-3">
          <Plus className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center text-sm">
        <div className="card p-3">
          <p className="text-lg font-bold">{postCount}</p>
          <p className="text-[rgb(var(--muted))]">帖子</p>
        </div>
        <div className="card p-3">
          <p className="text-lg font-bold">{likeCount}</p>
          <p className="text-[rgb(var(--muted))]">点赞</p>
        </div>
        <div className="card p-3">
          <p className="text-lg font-bold">{favCount}</p>
          <p className="text-[rgb(var(--muted))]">收藏</p>
        </div>
      </div>

      <ul className="card divide-y divide-[rgb(var(--border))] overflow-hidden">
        {links.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="flex items-center gap-3 px-4 py-3.5 text-sm hover:bg-[rgb(var(--hover))]"
            >
              <item.icon className="h-4 w-4 shrink-0 text-[rgb(var(--muted))]" />
              <span className="flex-1 font-medium">{item.label}</span>
              {item.desc && (
                <span className="text-xs text-[rgb(var(--muted))]">{item.desc}</span>
              )}
              <ChevronRight className="h-4 w-4 text-[rgb(var(--muted))]" />
            </Link>
          </li>
        ))}
        {u.role === "admin" && (
          <li>
            <Link
              href="/admin"
              className="flex items-center gap-3 px-4 py-3.5 text-sm hover:bg-[rgb(var(--hover))]"
            >
              <Shield className="h-4 w-4 text-brand-600" />
              <span className="flex-1 font-medium">管理后台</span>
              <ChevronRight className="h-4 w-4 text-[rgb(var(--muted))]" />
            </Link>
          </li>
        )}
      </ul>

      <MeSignOutButton />
    </div>
  );
}