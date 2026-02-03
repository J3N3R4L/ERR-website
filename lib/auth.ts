import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

export type SessionPayload = {
  userId: string;
  role: string;
};

export const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
};

export const verifyPassword = async (password: string, hash: string) =>
  bcrypt.compare(password, hash);

export const createSessionToken = (payload: SessionPayload) =>
  jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });

export const verifySessionToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionPayload;
  } catch {
    return null;
  }
};
