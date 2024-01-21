import { drizzle } from "drizzle-orm/planetscale-serverless";
import { connect } from "@planetscale/database";
import { Config } from "sst/node/config";

const connection = connect({
  host: Config.DATABASE_HOST,
  username: Config.DATABASE_USERNAME,
  password: Config.DATABASE_PASSWORD,
});

const db = drizzle(connection);

export { db };
