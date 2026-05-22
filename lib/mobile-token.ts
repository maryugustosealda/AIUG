import { SignJWT, jwtVerify } from "jose";

const SECRET = process.env.NEXTAUTH_SECRET;
const TOKEN_TTL = "30d";

if (!SECRET) {
  // 启动时不抛错,但运行到这里会被实际拒
  console.warn("[mobile-token] NEXTAUTH_SECRET not set");
}

const key = () => new TextEncoder().encode(SECRET || "");

export type MobilePayload = {
  uid: string;
  email: string;
  username: string;
  role: string;
};

export async function signMobileToken(payload: MobilePayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer("aiug-mobile")
    .setExpirationTime(TOKEN_TTL)
    .sign(key());
}

export async function verifyMobileToken(token: string): Promise<MobilePayload | null> {
  if (!SECRET) return null;
  try {
    const { payload } = await jwtVerify(token, key(), { issuer: "aiug-mobile" });
    if (!payload.uid || !payload.email) return null;
    return {
      uid: String(payload.uid),
      email: String(payload.email),
      username: String(payload.username),
      role: String(payload.role || "user"),
    };
  } catch {
    return null;
  }
}

/**
 * 从 Authorization: Bearer <token> 解析,适用于路由保护
 */
export async function getMobileUserFromHeader(req: Request): Promise<MobilePayload | null> {
  const auth = req.headers.get("authorization") || req.headers.get("Authorization");
  if (!auth || !auth.toLowerCase().startsWith("bearer ")) return null;
  const token = auth.slice(7).trim();
  if (!token) return null;
  return verifyMobileToken(token);
}

