import { bigint, boolean, char, int, mysqlTable } from "drizzle-orm/mysql-core";

const replicacheServer = mysqlTable("replicache_server", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement().notNull(),
  version: bigint("version", { mode: "number" }),
});

const replicacheClient = mysqlTable("replicache_client", {
  id: char("id", { length: 36 }).notNull().primaryKey(),
  clientGroupId: char("client_group_id", { length: 36 }).notNull(),
  lastMutationId: bigint("last_mutation_id", {
    mode: "number",
  })
    .default(0)
    .notNull(),
  version: int("version").notNull(),
});

const message = mysqlTable("message", {
  id: char("id", { length: 36 }).notNull().primaryKey(),
  sender: char("sender", { length: 255 }).notNull(),
  content: char("content", { length: 255 }).notNull(),
  sort: int("sort").notNull(),
  deleted: boolean("deleted").notNull(),
  version: int("version").notNull(),
});

export { replicacheServer, replicacheClient, message };
