// src/04-Infrastructure/Persistence/Mappers/Base/SsoKeyMapper.ts

import SsoKey from "#Infrastructure/Persistence/Models/Base/SsoKey.ts";
import { Sso as DomainSso } from "#Domain/Entities/Base/User/Sso.ts";

export default class SsoKeyMapper {

  static toOrm(entity: DomainSso): SsoKey {

    const model = SsoKey.build({

      TypeId: entity.type_id,
      SsoId: entity.sso_id,
      CreatedBy: entity.created_by

    });

    return model;

  }

}