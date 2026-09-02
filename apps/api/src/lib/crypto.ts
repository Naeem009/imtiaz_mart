import crypto from "crypto";

const KEY = process.env.SOCIAL_ENCRYPTION_KEY || "dev_local_change_me_32bytes_min_length!";

if (KEY.length < 32) {
  throw new Error("SOCIAL_ENCRYPTION_KEY must be at least 32 characters");
}

if (process.env.NODE_ENV === "production" && !process.env.SOCIAL_ENCRYPTION_KEY) {
  throw new Error("SOCIAL_ENCRYPTION_KEY is required in production");
}

export function encryptText(plaintext: string) {
  const iv = crypto.randomBytes(12);
  const key = Buffer.from(KEY).slice(0, 32);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const enc = Buffer.concat([cipher.update(Buffer.from(plaintext, "utf8")), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString("base64");
}

export function decryptText(ciphertext: string) {
  const data = Buffer.from(ciphertext, "base64");
  const iv = data.slice(0, 12);
  const tag = data.slice(12, 28);
  const enc = data.slice(28);
  const key = Buffer.from(KEY).slice(0, 32);
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  const out = Buffer.concat([decipher.update(enc), decipher.final()]);
  return out.toString("utf8");
}
