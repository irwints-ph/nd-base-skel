import { Request, Response, NextFunction } from "express";
import { GetUserRepository } from "@Infrastructure/Dependencies/UserRepoProvider.ts";
import { getActiveUser } from "@Infrastructure/Auth/RequestUtils.ts";

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

// /**
//  * Generic route handler factory
//  * @param ControllerClass - the controller class to instantiate
//  * @param method - name of the controller method to call
//  */
// export function routeHandler<T>(
//   ControllerClass: new (repo: any) => T,
//   method: keyof T
// ) {
//   return async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       // Get repository instance
//       const repo = GetUserRepository(); // ✅ call function
//       //Already done in GlobalInterceptor
//       //Those without values are on PUBLIC_PATHS or PUBLIC_PREFIXES
//       //If user is need remove in PUBLIC 
//       // This is for /api/modules/routes
//       const currentUser = (req as any).currentUser;
//       if(!currentUser){
//         const user = await getActiveUser(req)
//         if(user){
//           (req as any).currentUser = user;
//         }
//       }      
//       // Instantiate controller
//       const controller = new ControllerClass(repo);

//       // Call the controller method
//       return await (controller[method] as any)(req, res, next);
//     } catch (err) {
//       return next(err); // ✅ propagate errors to express
//     }
//   };
// }
