// ===================================================================
// 🧩 src/02-Application/UseCases/Auth/AuthenticateOLUserUseCase.ts
// ===================================================================
import { IUserRepository } from "@Domain/Interfaces/Base/IUserRepository.ts";
import { EnvConfig } from "@Infrastructure/Core/ConfigLoader.ts";
import { logger } from "@Infrastructure/Core/Logger.ts";
import { UserDtoMapper } from "@Infrastructure/Persistence/Mappers/Base/UserDtoMapper.ts";
import { performRepoAction } from "@Infrastructure/Persistence/Services/RepoActionService.ts";
import { buildUser } from "@Application/Services/Base/UserFactory.ts";
import { User } from "03-Domain/Entities/Base/User/User.ts";
import { UserMstr } from "04-Infrastructure/Persistence/Models/Base/index.ts";

export class AuthenticateOLUserUseCase {
  private userRepoFactory: () => IUserRepository;

  constructor(userRepoFactory: () => IUserRepository) {
    this.userRepoFactory = userRepoFactory;
  }

  async execute(token: string, ssokey: string) {
    const repo = this.userRepoFactory();
    const userDomain = await repo.getBySsoId(ssokey, 1);

    if (userDomain) {
      return UserDtoMapper.toDomainUserFlatBase(userDomain);
    }

    try {
      const userInfo = await this.fetchOlUserInfo(token);
      const email = userInfo.email;

      let ormUser:UserMstr | null = await repo.getByEmailOrm(email);

      if (ormUser) {
        const action = async (uow: any) => {
          const repo = this.userRepoFactory();
          // repo.session = uow.session;

          const ormUserTx:User | null = await repo.getByEmail(email,uow.session);

          await repo.addSso(
            ormUser!,
            ssokey,
            1,
            ormUserTx?.id ?? -1,
            uow.session,
          );

          const domainUser:User | null = await repo.getById(ormUserTx?.id ?? -1);
          if(domainUser){
            domainUser?.validateEmail(email);
            await repo.save(domainUser,uow.session);
          }

          return ormUserTx;
        };

        const OutDomainUser = await performRepoAction({
          changedBy: ormUser.Username ?? "",
          actionName: "LinkSsoEmail",
          action,
          idFields: ["UserId"],
          showlog: false,
        });

        return UserDtoMapper.toDomainUserFlatBase(ormUser);
      }

      // Auto create if allowed
      if (!EnvConfig.oidc.auto_create) {
        logger.error("💡 New Application user, OL Auto create disabled.");
        return null;
      }

      return await this.createUserWithAudit(userInfo, ssokey);
    } catch (err: any) {
      logger.error("OL authentication failed: %s", err.message);
      return null;
    }
  }

  private async fetchOlUserInfo(token: string): Promise<any> {
    const response = await fetch(EnvConfig.oidc.me, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch OL user info: ${response.statusText}`);
    }

    return await response.json();
  }

  private async createUserWithAudit(userInfo: any, ssokey: string, repo?: IUserRepository) {
    const createdName = `onelogin-${userInfo.email}`;
    const domainUser = await buildUser({
      username: userInfo.preferred_username,
      password: "", // No password for SSO users
      firstname: userInfo.given_name,
      lastname: userInfo.family_name,
      createdBy: -1,
      email: userInfo.email,
      // isEmailValidated: true,
    });
    let cuwaOrmUser:UserMstr | null = await repo?.getByEmailOrm(userInfo.email) ?? null;
    if(cuwaOrmUser !== null){
      repo?.addSso(
        cuwaOrmUser,
        ssokey,
        1,
        -1,
      );
    }
    const action = async (uow: any) => {
      const repo = this.userRepoFactory();
      // repo.session = uow.session;
      return await repo.add(domainUser, uow.session);
    };

    const ormUser = await performRepoAction({
      changedBy: createdName,
      actionName: "CreateOlUser",
      action,
      idFields: ["UserId"],
      showlog: false,
    });

    return UserDtoMapper.toDomainUserFlatBase(ormUser);
  }
}
