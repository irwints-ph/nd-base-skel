// ==================================================================
// 🧩 ContactMapper.ts
// ==================================================================

import ContactMstr from "#Infrastructure/Persistence/Models/Base/ContactMstr.ts";
import { Contact } from "#Domain/Entities/Base/User/Contact.ts";
import { AppTime } from "#Infrastructure/Core/AppTime.ts";

export default class ContactMapper {

  static toOrm(entity: Contact): ContactMstr {
    const model = ContactMstr.build({
      Id: entity.Id, // IMPORTANT: supports updates

      ContactTypeId: entity.ContactTypeId,
      ContactValue: entity.ContactValue,

      Validated: entity.Validated ?? false,
      IsPrimary: entity.IsPrimary ?? false,

      UserId: entity.UserId,

      CreatedBy: entity.CreatedBy ?? 0,
      CreatedOn: entity.CreatedOn ?? AppTime.utcNow(),

      ValidationDate: entity.ValidationDate ?? null,
    });

    return model;
  }

  // ---------------------------------------------------------
  // ORM ➜ Domain (recommended add-on)
  // ---------------------------------------------------------
  static toDomain(model: ContactMstr): Contact {
    return new Contact({
      id: model.Id,
      contactTypeId: model.ContactTypeId,
      contactValue: model.ContactValue,
      isPrimary: model.IsPrimary,
      validated: model.Validated,
      validationDate: model.ValidationDate,
      userId: model.UserId,
      createdBy: model.CreatedBy ?? undefined,
      createdOn: model.CreatedOn ?? undefined,
    });
  }
}