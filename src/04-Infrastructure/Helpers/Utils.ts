// ===================================================================
// 🧩 App/Infrastructure/Helpers/Utils.ts
// ===================================================================

import crypto from "crypto";
// import { aesEncrypt, aesDecrypt } from "@Infrastructure/Lib/CryptoLib.ts";

const BLOCK_SIZE = 16
const KEY_SIZE = 32
const ITERATIONS = 100_000
const SALT = "static_salt"

export class Utils {

  /**
   * Generate secure random string
   */
  static generateRandomString(length: number): string {

    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    const bytes = crypto.randomBytes(length);
    let result = "";

    for (let i = 0; i < length; i++) {
      result += chars[bytes[i] % chars.length];
    }

    return result;
  }

  /**
   * Generate numeric OTP
   */
  static generateOtp(length: number = 6): string {

    const digits = "0123456789";
    const bytes = crypto.randomBytes(length);

    let otp = "";

    for (let i = 0; i < length; i++) {
      otp += digits[bytes[i] % digits.length];
    }

    return otp;
  }

  /**
   * Encrypt string
   */
  // static encryptString(plainText: string, key: string): string {

  //   return aesEncrypt(
  //     plainText,
  //     key,
  //     "static_salt"
  //   );
  // }

  static encryptString(plainText: string, password: string): string {
    const iv = crypto.randomBytes(BLOCK_SIZE)

    const key = crypto.pbkdf2Sync(password, SALT, ITERATIONS, KEY_SIZE, "sha256")
    const cipher = crypto.createCipheriv("aes-256-cbc", key, iv)

    // PKCS7 padding is automatic in Node crypto
    let encrypted = cipher.update(plainText, "utf8")
    encrypted = Buffer.concat([encrypted, cipher.final()])

    // Return same format as Python: base64(iv + encrypted)
    return Buffer.concat([iv, encrypted]).toString("base64")
  }

  /**
   * Decrypt string
   */
  // ----------------------------
  // Decrypt string (AES)
  // ----------------------------
  static decryptString(cipherText: string, password: string): string {
    if (!cipherText) throw new Error("cipherText is required")
    if (!password) throw new Error("password is required")

    const data = Buffer.from(cipherText, "base64")
    if (data.length <= BLOCK_SIZE) {
      throw new Error("cipherText too short to contain IV + encrypted payload")
    }

    const iv = data.slice(0, BLOCK_SIZE)
    const encrypted = data.slice(BLOCK_SIZE)

    const key = crypto.pbkdf2Sync(password, SALT, ITERATIONS, KEY_SIZE, "sha256")
    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv)
    decipher.setAutoPadding(true) // ✅ Let Node handle PKCS7 padding automatically

    console.log("KEY:", key.toString("base64"))
    console.log("IV:", iv.toString("base64"))
    console.log("CIPHER:", encrypted.toString("base64"))
    console.log("FULL:", Buffer.concat([iv, encrypted]).toString("base64"))
    
    let decrypted = decipher.update(encrypted)
    decrypted = Buffer.concat([decrypted, decipher.final()])

    return decrypted.toString("utf8")
  }

  /**
   * Company name helper
   */
  static companyName(): string {
    return "The Company";
  }

}