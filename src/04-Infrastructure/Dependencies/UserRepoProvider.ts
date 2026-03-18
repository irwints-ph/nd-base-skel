import { IUserRepository } from "@Domain/Interfaces/Base/IUserRepository.ts";
import { UserRepository } from "04-Infrastructure/Persistence/Repositories/Base/UserRepository.ts";

let instance: IUserRepository | null = null

export function GetUserRepository(): IUserRepository {
  if (!instance) {
    instance = new UserRepository()
  }
  return instance
}
