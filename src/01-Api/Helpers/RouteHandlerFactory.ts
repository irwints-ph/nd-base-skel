import { Request, Response, NextFunction } from "express";
import { GetUserRepository } from "#Infrastructure/Dependencies/UserRepoProvider.ts";
import { getActiveUser } from "#Infrastructure/Auth/RequestUtils.ts";

type ControllerMethod = (req: Request, res: Response, next: NextFunction) => any;

export function routeHandler<T>(
  ControllerClass: new (repo: ReturnType<typeof GetUserRepository>) => T,
  method: keyof T
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const repo = GetUserRepository();
      // req.currentUser is now type from src\types\express.d.ts
      if (!req.currentUser) {
        const user = await getActiveUser(req);
        if (user) req.currentUser = user;
      }

      const controller = new ControllerClass(repo);

      const handler = controller[method];

      if (typeof handler !== "function") {
        throw new Error(`Method ${String(method)} is not a function`);
      }

      return await (handler as ControllerMethod).call(controller, req, res, next);
    } catch (err) {
      return next(err);
    }
  };
}
