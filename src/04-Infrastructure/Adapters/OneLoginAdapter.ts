// ===================================================================
// 🧩 src/Infrastructure/Adapters/OneLoginAdapter.ts
// ===================================================================
import { OneLoginService } from "@Infrastructure/Auth/OneLoginService.ts";

export class OneLoginAdapter {
  static async createUser(userDto: any) {
    const service = new OneLoginService();
    return await service.createUser(
      userDto.username,
      userDto.email,
      userDto.password,
      userDto.firstname,
      userDto.lastname
    );
  }
}
