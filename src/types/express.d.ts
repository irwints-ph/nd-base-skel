// src/types/express.d.ts

import { UserFlatBase } from "@Contracts/Base/Users/UserSchemas.ts";

declare global {
  namespace Express {
    interface Request {
      currentUser?: UserFlatBase;
    }
  }
}

export {}; // 👈 important to make this a module