// src/contracts/base/users/UserSchemas.ts

// import { UserMstr } from "@/03-domain/models/base/index.ts"
// import { ContactTypes } from "@/03-domain/models/constants/ContactTypes.ts";


export interface UserProfileSchema {
  firstname: string
  lastname: string
  email: string
}

export interface SsoSchema {
  tokenId: number
  ssoId: string
}

export interface UserBase {
  username: string
  profile: UserProfileSchema
  sso?: SsoSchema
}

export interface UserSchema extends UserBase {
  userId: number
  createdBy?: number
}

export interface UserCreateFromSso {
  username: string
  email: string
  firstname: string
  lastname: string
  mobile?: string
  password?: string
}

export interface UserActivationRequest {
  userId?: number
  email?: string
}

export interface UserCreateSchema {
  username: string
  email?: string
  firstname?: string
  lastname?: string
  password?: string
  ssoId?: string
  createdBy?: number
  active?: boolean
  begDate?: Date
  endDate?: Date
  typeId?: number
}

export interface UserUpdateSchema {
  userId: number
  username?: string
  active?: boolean
  email?: string
  firstname?: string
  lastname?: string
  ssoId?: string
  typeId?: number
  updatedBy?: number
  begDate?: Date
  endDate?: Date
}
export interface UserFlatBase {
  userId: number
  username: string
  email?: string
  emailIsActive?: boolean
  firstname: string
  lastname: string
  active?: boolean
  begDate?: Date| null
  endDate?: Date| null
  createdBy?: number | null
  createdOn?: Date | null
  updatedBy?: number| null
  updatedOn?: Date | null
  fullname: string | null
  ssoId?: string | null
}

export interface UserFlatReturn {
  success: boolean
  message?: string
  data?: Record<string, any> | UserFlatBase
}

export interface UserReturn {
  success: boolean
  message?: string
  data?: UserSchema | UserFlatBase | null
}

export interface UserActivationResponse {
  email: string
  verifyOnly?: boolean
}
