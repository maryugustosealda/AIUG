import { NextAuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { prisma } from "./prisma";
import { isAdminEmail } from "./utils";
import { verifyMobileToken } from "./mobile-token";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "邮箱", type: "email" },
        password: { label: "密码", type: "password" },
      },
      async authorize(creds) {
        if (!creds?.email || !creds?.password) return null;
        const user = await prisma.user.findUnique({
          where: { email: String(creds.email).toLowerCase() },
        });
        if (!user) return null;
        const ok = await bcrypt.compare(String(creds.password), user.passwordHash);
        if (!ok) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.nickname,
          image: user.avatar ?? undefined,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.uid = (user as any).id;
      }
      if (token.email) {
        const u = await prisma.user.findUnique({
          where: { email: token.email },
          select: { id: true, role: true, username: true, nickname: true, avatar: true },
        });
        if (u) {
          token.uid = u.id;
          token.username = u.username;
          token.nickname = u.nickname;
          token.avatar = u.avatar;
          token.role = isAdminEmail(token.email) ? "admin" : u.role;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.uid;
        (session.user as any).username = token.username;
        (session.user as any).nickname = token.nickname;
        (session.user as any).avatar = token.avatar;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
};

export const auth = () => getServerSession(authOptions);

/**
 * 从请求头读取移动端 JWT(Authorization: Bearer ...),返回 user 信息
 */
async function getMobileUser() {
  try {
    const h = headers();
    const authz = h.get("authorization") || h.get("Authorization");
    if (!authz || !authz.toLowerCase().startsWith("bearer ")) return null;
    const token = authz.slice(7).trim();
    if (!token) return null;
    const payload = await verifyMobileToken(token);
    if (!payload) return null;
    const u = await prisma.user.findUnique({
      where: { id: payload.uid },
      select: { id: true, email: true, username: true, nickname: true, avatar: true, role: true },
    });
    if (!u) return null;
    return {
      id: u.id,
      email: u.email,
      username: u.username,
      nickname: u.nickname,
      avatar: u.avatar ?? undefined,
      role: isAdminEmail(u.email) ? "admin" : u.role,
    };
  } catch {
    return null;
  }
}

export async function requireUser() {
  // 优先 Bearer token(移动端);其次 NextAuth session(网页端)
  const mobile = await getMobileUser();
  if (mobile) return mobile;

  const session = await auth();
  if (!session?.user) throw new Error("UNAUTHENTICATED");
  return session.user as {
    id: string;
    email: string;
    nickname: string;
    username: string;
    avatar?: string;
    role: string;
  };
}

export async function requireAdmin() {
  const u = await requireUser();
  if (u.role !== "admin") throw new Error("FORBIDDEN");
  return u;
}

