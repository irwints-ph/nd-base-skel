// src/01-Contracts/Auth/LoginSchema.ts

export interface Token {
  success: boolean
  accessToken?: string | null
  tokenType?: string | null // default "bearer"
  message?: string | null
}

export function tokenResponse(overrides: Partial<Token>): Token {
  return {
    success: false,
    accessToken: null,
    tokenType: "bearer",
    message: null,
    ...overrides,
  };
}
export interface UserRegister {
  email: string
  feserver?: string | null
  verifyOnly?: boolean | null // default false
}

export interface TokenData {
  token?: string | null
  passwd?: string | null
}

export interface LoginRequest {
  username: string
  password: string
}
