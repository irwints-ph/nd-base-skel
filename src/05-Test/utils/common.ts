// src/tests/utils/common.ts
import jwt from "jsonwebtoken";
import { EnvConfig } from "#Infrastructure/Core/ConfigLoader.ts"; // adjust import path

// -------------------------------
// Fake user and fake module for testing
// -------------------------------
export class FakeUserGeneric {
  UserId: number;
  Username: string;
  Profile: any;
  Contacts: any[];
  Sso: any;
  BegDate: Date;
  EndDate: Date;
  CreatedBy: string;
  CreatedOn: Date;
  UpdatedBy: string;
  UpdatedOn: Date;

  constructor(userId = 1, username = "testuser") {
    this.UserId = userId;
    this.Username = username;
    this.Profile = null;
    this.Contacts = [];
    this.Sso = null;
    this.BegDate = new Date();
    this.EndDate = new Date();
    this.CreatedBy = "tester";
    this.CreatedOn = new Date();
    this.UpdatedBy = "tester";
    this.UpdatedOn = new Date();
  }
}

export class FakeUser {
  userId: number;
  username: string;
  fullname: string;
  profile: any;
  contacts: any[];
  sso: any;

  constructor() {
    this.userId = 1;
    this.username = "root";
    this.fullname = "Super Root";
    this.profile = null;
    this.contacts = [];
    this.sso = null;
  }
}

export class FakeModule {
  controllerName: string;
  authorization: string[];

  constructor() {
    this.controllerName = "users";
    this.authorization = ["Y"]; // "Y" = allowed
  }
}

// -------------------------------
// Token generator for tests
// -------------------------------
export function createTestToken(): string {
  // const localIssuer = `${"http"}://${"localhost:3000"}`; //"http://testserver"
  const localIssuer = EnvConfig.jwt.JWT_ISSUER;
  const payload = {
    sub: "1",
    email: "root@email.org",
    name: "Root User",
    iss: localIssuer,
    exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour expiry
    iat: Math.floor(Date.now() / 1000),
  };

  return jwt.sign(payload, EnvConfig.jwt.JWT_SECRET_KEY, {
    algorithm: EnvConfig.jwt.JWT_ALGORITHMS as jwt.Algorithm,
  });
}
