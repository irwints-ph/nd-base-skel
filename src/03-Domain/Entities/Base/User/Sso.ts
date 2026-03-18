// ==================================================================
// 🧩 src/03-Domain/Entities/Base/User/Sso.ts
// ==================================================================


import { AppTime } from "@Infrastructure/Core/AppTime.ts";

export class Sso {
  type_id: number
  sso_id: string
  user_id?: number
  created_by?: number
  created_on?: Date
  updated_by?: number
  updated_on?: Date

  constructor({
    type_id,
    sso_id,
    created_by,
    created_on,
    user_id,
    updated_by,
    updated_on
  }: {
    type_id: number
    sso_id: string
    created_by?: number
    created_on?: Date
    user_id?: number
    updated_by?: number
    updated_on?: Date
  }) {

    this.type_id = type_id
    this.sso_id = sso_id
    this.created_by = created_by
    this.created_on = created_on
    this.updated_by = updated_by
    this.updated_on = updated_on
    if (user_id !== undefined) {
      this.user_id = user_id
    }
  }

  updateSso(ssoId: string, updatedBy: number) {
    this.sso_id = ssoId
    this.updated_by = updatedBy
    this.updated_on = AppTime.utcNow()
  }
}