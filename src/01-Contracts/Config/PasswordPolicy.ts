// ===================================================================
// 🧩 App/Contracts/Config/PasswordPolicy.ts
// ===================================================================

export interface PasswordPolicy {
  Active: boolean
  MinimumLength?: number
  MinUppercase?: number
  MinLowercase?: number
  MinDigits?: number
  MinSpecialCharacters?: number
  SpecialCharacters?: string
}