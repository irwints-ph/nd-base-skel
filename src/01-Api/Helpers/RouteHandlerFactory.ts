// src/Api/Helpers/RouteHandlerFactory.ts
import { Request, Response, NextFunction } from "express";

/**
 * Generic route handler factory
 * @param ControllerClass - the controller class to instantiate
 * @param repoFactory - function that returns the repository
 * @param method - name of the controller method to call
 */
export function routeHandler<T>(
  ControllerClass: new (repo: any) => T,
  repoFactory: () => any,
  method: keyof T
) {
  return (req: Request, res: Response, next: NextFunction) => {
    const repo = repoFactory();
    const controller = new ControllerClass(repo);
    // dynamic method call
    return (controller[method] as any)(req, res, next);
  };
}
