// ===================================================================
// 🧩 src/02-Application/UseCases/Auth/AuthenticateOLUserUseCase.ts
// ===================================================================
import { EnvConfig } from "@Infrastructure/Core/ConfigLoader.ts";
import { logger } from "@Infrastructure/Core/Logger.ts";
import { UserDtoMapper } from "@Infrastructure/Persistence/Mappers/Base/UserDtoMapper.ts";
import { User } from "@Domain/Entities/Base/User/User.ts";
import { UserMstr } from "@Infrastructure/Persistence/Models/Base/index.ts";
import { CreateOlUserCommand } from "@Application/Commands/Base/Users/CreateOlUserCommand.ts";
import { CreateOlUserHandler } from "@Application/Handlers/Base/CreateOlUserHandler.ts";
import { UserCreateFromSso } from "@Contracts/Base/Users/UserSchemas.ts";
import { GetUserRepository } from "@Infrastructure/Dependencies/UserRepoProvider.ts";
import { performRepoAction } from "@Infrastructure/Persistence/Services/RepoActionService.ts";
import { UnitOfWork } from "@Application/UoW/UnitOfWork.ts";

export class AuthenticateOLUserUseCase {
  // private userRepoFactory: () => IUserRepository;
  //Mimic Dependency Injection
  private userRepoFactory = () => GetUserRepository();

  // constructor(userRepoFactory: () => IUserRepository) {
  //   this.userRepoFactory = userRepoFactory;
  // }

  async execute(token: string, ssokey: string,uow: UnitOfWork) {
    const repo = this.userRepoFactory();
    const userDomain = await repo.getBySsoId(ssokey, 1,uow.transaction);
    //User with the ssoKey found, return this user
    if (userDomain) {
      // return userDomain;
      return UserDtoMapper.toDomainUserFlatBase(userDomain);
    }

    try {
      //Get OneLogin Details
      const userInfo = await this.fetchOlUserInfo(token);
      const email = userInfo.email;

      //Check if email is existing on DB
      let ormUser:UserMstr | null = await repo.getByEmailOrm(email,uow.transaction);

      //Existing: Update the user with the sso and validate email if not validated
      if (ormUser) {
        //Update user with new sso and validate email
        const action = async (uow: any) => {
          // repo.session = uow.transaction; // Good for showing log but has error on sqlite
          const domainUser:User | null = await repo.getById(ormUser.UserId,uow.transaction);
          if(domainUser){
            domainUser.addSso(
              ssokey,          // OneLogin ID
              1,               // OneLogin type
              ormUser.UserId   // Created by the sso user loginin
            );
            domainUser.validateEmail(email);
            const updatedOrmUSer = await repo.save(domainUser,uow.transaction);
            return updatedOrmUSer ? UserDtoMapper.toOrmUserFlatBase(updatedOrmUSer) : null;
          }
        };
        const OutDomainUser = await performRepoAction({
          changedBy: ormUser.Username ?? "",
          actionName: "LinkSsoEmail",
          action,
          showlog: false,
        });
        return OutDomainUser; //Updated ORM Values
      }
      //------------------------------------------------------------
      // Not Exisitng - Auto create if allowed
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


  private async createUserWithAudit(userInfo: any, ssokey: string) {
    try{
      const ssoUser: UserCreateFromSso = {
        ssoId: ssokey,
        username: userInfo.preferred_username,
        email: userInfo.email,
        firstname: userInfo.given_name,
        lastname: userInfo.family_name,
        password:  "", // No password for SSO users
      };
      const cmd: CreateOlUserCommand = {
        user: ssoUser,
        createdBy: -1,
      };

      const handler = new CreateOlUserHandler();

      const flatUser = await handler.handle(cmd);
      return flatUser;
    }
    catch (err: any) {
      // return this.error(res, `Faild to create: ${err.message}`)
    }

  }
}
