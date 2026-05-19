// // test_cu.test.ts
// import request from "supertest";
// import { createApp } from "../app.ts";
// import { sequelize } from "./setup.ts";

// const app = createApp();

// test("should create user", async () => {
//   const payload = { email: "createu@email.com", username: "createu", firstname: "Create", lastname: "User" };

//   const response = await request(app)
//     .post("/api/users")
//     .send(payload);

//   if(response.status != 200)
//     console.log(response.body);

//   expect(response.status).toBe(200);
//   expect(response.body.success).toBe(true);
//   expect(response.body.data.email).toBe(payload.email);
// });

import { client } from "./setup.ts";
import assert from "node:assert/strict";
// import jwt from "jsonwebtoken";
import { createTestToken } from "./utils/common.ts";
import { FetchClient } from "./utils/httpClient.ts";
// const fakeToken = jwt.sign({ id: "fake-user", name: "Test User" }, "test-secret");
const fakeToken = createTestToken();
const payload = {
  email: "createu@email.com",
  firstname: "Create",
  lastname: "User",
  username: "createu"
};

describe("User Creation", () => {
  it(`should create user ${payload.email}`, async () => {
    // const client = new FetchClient("http://localhost:3000");
    // const response = await client.post("/api/users", fakeToken, payload);
    const response = await client
      .post("/api/users")
      .set("Authorization", `Bearer ${fakeToken}`)
      .send(payload);

    
    if(response.status != 200)
      // console.log("response");
      console.log(response.body);
    
    assert.strictEqual(response.status, 200);
    assert.strictEqual(response.body.success, true);
    assert.strictEqual(response.body.data.email, payload.email);
  });
});