// ===========================================
// 🧩 Domain/Entities/Base/Otp.ts
// ===========================================

export class Otp {
  public Email: string;
  public Code: string;
  public ExpiresAt: Date;
  public CreatedBy: number = 1; // System user

  constructor(email: string, code: string, expiresAt: Date) {
    this.Email = email;
    this.Code = code;
    this.ExpiresAt = expiresAt;
  }

  // -----------------------------
  // Domain Behavior
  // -----------------------------

  public isExpired(now: Date = new Date()): boolean {
    return now > this.ExpiresAt;
  }
}
