// src/Infrastructure/Persistence/Dependencies/db.ts
import { sequelize } from "@Infrastructure/Persistence/AppDBContext.ts";
import { Transaction } from "sequelize";

export async function GetDbAsync(): Promise<Transaction> {
  return await sequelize.transaction();
}


export default { GetDbAsync }
