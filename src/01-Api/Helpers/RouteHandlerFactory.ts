import { Request, Response, NextFunction } from "express";
import { GetUserRepository } from "@Infrastructure/Dependencies/UserRepoProvider.ts";
import { getActiveUser } from "@Infrastructure/Auth/RequestUtils.ts"

/**
 * Generic route handler factory
 * @param ControllerClass - the controller class to instantiate
 * @param method - name of the controller method to call
 */
export function routeHandler<T>(
  ControllerClass: new (repo: any) => T,
  method: keyof T
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get repository instance
      const repo = GetUserRepository(); // ✅ call function
      //Already done in GlobalInterceptor
      //Those without values are on PUBLIC_PATHS or PUBLIC_PREFIXES
      //If user is need remove in PUBLIC 
      // This is for /api/modules/routes
      const currentUser = (req as any).currentUser;
      if(!currentUser){
        const user = await getActiveUser(req)
        if(user){
          (req as any).currentUser = user;
        }
      }      
      // Instantiate controller
      const controller = new ControllerClass(repo);

      // Call the controller method
      return await (controller[method] as any)(req, res, next);
    } catch (err) {
      return next(err); // ✅ propagate errors to express
    }
  };
}
