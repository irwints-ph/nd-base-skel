// // tests/setup.ts
// import { Sequelize } from "sequelize-typescript";
// import { seedDatabase } from "../Scripts/Migrations/seed_db.ts";

// export const sequelize = new Sequelize({
//   dialect: "sqlite",
//   storage: ":memory:", // in-memory DB for fast isolated tests
//   logging: false,
// });

// // Seed database once
// beforeAll(async () => {
//   jest.restoreAllMocks();
//   // jest.spyOn(console, "log").mockImplementation(() => {});
//   // jest.spyOn(console, "warn").mockImplementation(() => {});
//   // jest.spyOn(console, "error").mockImplementation(() => {});  

//   await sequelize.authenticate();
//   await seedDatabase({ createDb: true, reset: true, dataDir: "src/Scripts/DataSeed" });
// });

// afterAll(async () => {
//   await sequelize.close();
//   jest.restoreAllMocks();
// });

// tests/setup.ts
import type { Express } from "express";
// import request from "supertest";
import { createApp } from "../app.ts";
import { seedDatabase } from "../Scripts/Migrations/seed_db.ts";
import { sequelize } from "#Infrastructure/Persistence/AppDBContext.ts";
import { jest } from "#jest/globals";
// import request, { SuperTest, Test } from "supertest";
import request from "supertest";

export let client: ReturnType<typeof request>;
let testTransaction: import("sequelize").Transaction | null = null;

// -------------------------------------------------
// 🌱 Test environment
// -------------------------------------------------
beforeAll(async () => {
  jest.spyOn(console, "log").mockImplementation(() => {});
  jest.spyOn(console, "warn").mockImplementation(() => {});
  jest.spyOn(console, "error").mockImplementation(() => {});  
  process.env.ENVIRONMENT = "test";
  const app: Express = createApp();
  client = request(app);

  // console.log(`[DEBUG] ENVIRONMENT set to ${process.env.ENVIRONMENT}`);
  // console.log("[DEBUG] Seeding test database...");
  try {
    await seedDatabase({
      dataDir: "src/Scripts/DataSeed",
      createDb: true,
      reset: true,
    });
    console.log("✅ Test database seeded successfully");
  } catch (err) {
    console.error("❌ Failed to seed test database:", err);
    throw err;
  }
});

beforeEach(async () => {
  // Display console log from test
  jest.restoreAllMocks();
  testTransaction = null;
  // // open a new transaction for each test
  // testTransaction = await sequelize.transaction();
});

afterEach(async () => {
  // rollback after each test
  if (testTransaction) {
    await testTransaction.rollback();
    testTransaction = null;
  }
});

afterAll(async () => {
  // // close connection only once all tests are finished
  // console.log("[DEBUG] Closing test database connection...");
  // await sequelize.close();
  jest.restoreAllMocks();
  console.log("[DEBUG] Closing DB after all tests");
  await sequelize.close();  
});

// // -------------------------------------------------
// // 🔥 Mock middleware / services
// // -------------------------------------------------
// jest.unstable_mockModule("#Infrastructure/Auth/RequestUtils.ts", async () => ({
//   getActiveUser: async () => ({
//     id: "fake-user",
//     name: "Test User",
//   }),
// }));

jest.unstable_mockModule("#Application/Queries/Auth/AuthQueryService.ts", async () => ({
  getAuthorizedModulesByUser: async () => [{ name: "FakeModule" }],
}));

// jest.unstable_mockModule("#Infrastructure/Persistence/AppDBContext", () => ({
//   setupDatabase: async () => true,
//   shutdownDatabase: async () => {},
// }));

// -------------------------------------------------
// 🧪 Test client
// -------------------------------------------------
// export const testClient = request(app);
// export const testClient = () => request(app);
// -------------------------------------------------
// ✅ Helper to get current transaction in tests
// -------------------------------------------------
export const getTestTransaction = () => testTransaction;
