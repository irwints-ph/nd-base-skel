import ContactMstr from "@Infrastructure/Persistence/Models/Base/ContactMstr.ts";
import { Contact } from "@Domain/Entities/Base/User/Contact.ts";

import { AppTime } from "@Infrastructure/Core/AppTime.ts";

export default class ContactMapper {
  static toOrm(entity: Contact): ContactMstr {
    const model = ContactMstr.build({
      ContactTypeId: entity.ContactTypeId,
      ContactValue: entity.ContactValue,
      Validated: entity.Validated ?? false,
      IsPrimary: entity.IsPrimary,
      CreatedBy: entity.CreatedBy ?? 0, // or undefined
      CreatedOn: entity.CreatedOn ?? AppTime.utcNow(),
      ValidationDate: entity.Validated ? AppTime.utcNow() : undefined,
      UserId: entity.UserId, // optional
    });

    if (entity.Validated) {
      model.ValidationDate = AppTime.utcNow();
    }

    return model;
  }
}
