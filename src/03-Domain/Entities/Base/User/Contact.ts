// ==================================================================
// 🧩 src/03-Domain/Entities/Base/User/Contact.ts
// ==================================================================

export class Contact {
  // ---------------------------------------------------------
  // 🧱 Identity (NEW - matches surrogate PK)
  // ---------------------------------------------------------
  Id?: number

  // ---------------------------------------------------------
  // 🔗 Core fields
  // ---------------------------------------------------------
  ContactTypeId: number
  ContactValue: string
  IsPrimary: boolean

  Validated: boolean
  ValidationDate?: Date | null

  // ---------------------------------------------------------
  // 🔗 Relationship
  // ---------------------------------------------------------
  UserId?: number

  // ---------------------------------------------------------
  // 🧾 Audit
  // ---------------------------------------------------------
  CreatedBy?: number
  CreatedOn?: Date
  UpdatedBy?: number
  UpdatedOn?: Date

  constructor(params: {
    id?: number
    contactTypeId: number
    contactValue: string
    isPrimary?: boolean
    validated?: boolean
    validationDate?: Date | null
    userId?: number

    createdBy?: number
    createdOn?: Date
  }) {
    this.Id = params.id

    this.ContactTypeId = params.contactTypeId
    this.ContactValue = params.contactValue

    this.IsPrimary = params.isPrimary ?? false
    this.Validated = params.validated ?? false
    this.ValidationDate = params.validationDate ?? null

    this.UserId = params.userId

    this.CreatedBy = params.createdBy
    this.CreatedOn = params.createdOn
  }

  // ---------------------------------------------------------
  // 🧠 Domain helpers (optional but useful)
  // ---------------------------------------------------------

  markAsPrimary() {
    this.IsPrimary = true
  }

  markAsValidated(date: Date = new Date()) {
    this.Validated = true
    this.ValidationDate = date
  }

  get isValid(): boolean {
    return this.Validated === true
  }
}