// ==================================================================
// 🧩 src/03-Domain/Entities/Base/User/Contact.ts
// ==================================================================

export class Contact {

  ContactTypeId: number
  ContactValue: string
  IsPrimary: boolean

  Validated: boolean
  ValidationDate?: Date

  CreatedBy?: number
  CreatedOn?: Date
  UpdatedBy?: number | void
  UpdatedOn?: Date | void

  UserId?: number

  constructor({
    contactTypeId,
    contactValue,
    isPrimary,
    validated = false,
    validationDate,
    createdBy,
    createdOn,
    userId
  }: {
    contactTypeId: number
    contactValue: string
    isPrimary: boolean
    validated?: boolean
    validationDate?: Date
    createdBy?: number
    createdOn?: Date
    userId?: number
  }) {

    this.ContactTypeId = contactTypeId
    this.ContactValue = contactValue
    this.IsPrimary = isPrimary

    this.Validated = validated
    this.ValidationDate = validationDate

    this.CreatedBy = createdBy
    this.CreatedOn = createdOn

    if (userId !== undefined) {
      this.UserId = userId
    }

  }

}