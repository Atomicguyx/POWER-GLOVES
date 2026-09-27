import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import type { TokenPurpose } from "@prisma/client";

// Creates a single-use, expiring token for email verification or password
// reset. The raw token (not a hash) is stored — fine here since these are
// short-lived, single-use, and the table holds nothing else sensitive.
export async function createToken(
  email: string,
  purpose: TokenPurpose,
  ttlMs: number
): Promise<string> {
  const token = randomBytes(32).toString("hex");
  await prisma.verificationToken.create({
    data: { token, email, purpose, expiresAt: new Date(Date.now() + ttlMs) },
  });
  return token;
}

// Validates and deletes a token in one step (single-use). Returns the
// associated email on success, or null if the token is missing, wrong
// purpose, or expired.
export async function consumeToken(
  token: string,
  purpose: TokenPurpose
): Promise<string | null> {
  const record = await prisma.verificationToken.findUnique({ where: { token } });
  if (!record || record.purpose !== purpose || record.expiresAt < new Date()) {
    return null;
  }
  await prisma.verificationToken.delete({ where: { token } });
  return record.email;
}
