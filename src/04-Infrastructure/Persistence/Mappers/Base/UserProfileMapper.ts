// ==================================================================
// 🧩 src/04-Infrastructure/Persistence/Mappers/Base/UserProfileMapper.ts
// ==================================================================
import UserProfile from "@Infrastructure/Persistence/Models/Base/UserProfile.ts";
import { UserProfile as DomainProfile } from "@Domain/Entities/Base/User/Profile.ts";
import { AppTime } from "@Infrastructure/Core/AppTime.ts";

export default class UserProfileMapper {
  
  // -------------------------
  // Domain -> ORM
  // -------------------------
  static toOrm(entity: DomainProfile): UserProfile {
    const model = UserProfile.build({
      Firstname: entity.Firstname,
      Lastname: entity.Lastname,
      CreatedBy: entity.CreatedBy,
      CreatedOn: AppTime.utcNow(),
    });

    // // Optional: preserve ID if exists
    // if (entity.id) {
    //   model.UserProfileId = entity.id;
    // }

    return model;
  }

}
