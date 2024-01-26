import { Context } from "sst/context/context2.js";

import { db } from "./client";
import { MySqlTransaction } from "drizzle-orm/mysql-core";
import {
  PlanetScalePreparedQueryHKT,
  PlanetscaleQueryResultHKT,
} from "drizzle-orm/planetscale-serverless";
import { ExtractTablesWithRelations } from "drizzle-orm";

export type Transaction = MySqlTransaction<
  PlanetscaleQueryResultHKT,
  PlanetScalePreparedQueryHKT,
  Record<string, never>,
  ExtractTablesWithRelations<Record<string, never>>
>;

type TxOrDb = Transaction | typeof db;

const TransactionContext = Context.create<{
  tx: TxOrDb;
}>("TransactionContext");

async function createTransaction<T>(callback: (tx: TxOrDb) => Promise<T>) {
  try {
    const { tx } = TransactionContext.use();

    return callback(tx);
  } catch {
    const result = await db.transaction(
      async (tx) => {
        const result = await TransactionContext.with({ tx }, async () => {
          return callback(tx);
        });

        return result;
      },
      { isolationLevel: "serializable" },
    );

    return result;
  }
}

export { createTransaction };
export type { TxOrDb };
