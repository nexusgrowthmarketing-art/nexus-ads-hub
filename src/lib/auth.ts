import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? "nexus-ads-hub-secret-key-2026-production"
);

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@nexusadshub";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "Nexus@2026";

export async function authenticate(email: string, password: string): Promise<string | null> {
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const token = await new SignJWT({ email, role: "admin" })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(SECRET);
    return token;
  }
  return null;
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload;
  } catch {
    return null;
  }
}

export async function getSession() {
  const cookieStore = cookies();
  const token = cookieStore.get("nexus_session")?.value;
  if (!token) return null;
  return verifyToken(token);
}
