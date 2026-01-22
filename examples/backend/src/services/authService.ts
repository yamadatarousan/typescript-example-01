import jwt from "jsonwebtoken";
import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { DomainError, domainErrorCodes } from "../domain/errors/domainError.js";
import { createUser, findUserByEmail } from "../repositories/userRepository.js";

export type AuthUser = {
  id: number;
  email: string;
};

export type AuthResult = {
  token: string;
  user: AuthUser;
};

function hashPassword(password: string, salt: string): string {
  return scryptSync(password, salt, 64).toString("hex");
}

function createPasswordHash(password: string): { hash: string; salt: string } {
  const salt = randomBytes(16).toString("hex");
  const hash = hashPassword(password, salt);
  return { hash, salt };
}

function verifyPassword(password: string, salt: string, hash: string): boolean {
  const computed = scryptSync(password, salt, 64);
  const stored = Buffer.from(hash, "hex");
  return computed.length === stored.length && timingSafeEqual(computed, stored);
}

function signToken(user: AuthUser, secret: string): string {
  return jwt.sign({ sub: user.id, email: user.email }, secret, {
    expiresIn: "7d",
  });
}

export async function signUp(
  email: string,
  password: string,
  jwtSecret: string,
): Promise<AuthResult> {
  const existing = await findUserByEmail(email);
  if (existing) {
    throw new DomainError("Email already registered.", domainErrorCodes.emailExists);
  }

  const { hash, salt } = createPasswordHash(password);
  const user = await createUser({
    email,
    passwordHash: hash,
    passwordSalt: salt,
  });

  const authUser = { id: user.id, email: user.email };
  return { token: signToken(authUser, jwtSecret), user: authUser };
}

export async function login(
  email: string,
  password: string,
  jwtSecret: string,
): Promise<AuthResult> {
  const user = await findUserByEmail(email);
  if (!user) {
    throw new DomainError("Invalid credentials.", domainErrorCodes.invalidCredentials);
  }

  const valid = verifyPassword(password, user.passwordSalt, user.passwordHash);
  if (!valid) {
    throw new DomainError("Invalid credentials.", domainErrorCodes.invalidCredentials);
  }

  const authUser = { id: user.id, email: user.email };
  return { token: signToken(authUser, jwtSecret), user: authUser };
}
