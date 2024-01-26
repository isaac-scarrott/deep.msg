import { defineConfig } from "drizzle-kit";

const connection = {
  user: process.env["SST_Secret_value_DATABASE_USERNAME"],
  password: process.env["SST_Secret_value_DATABASE_PASSWORD"],
  host: "aws.connect.psdb.cloud",
};

export default defineConfig({
  out: "./migrations/",
  strict: true,
  schema: "./src/database/schema.ts",
  verbose: true,
  driver: "mysql2",
  dbCredentials: {
    uri: `mysql://${connection.user}:${connection.password}@${connection.host}:3306/deepmsg?ssl={"rejectUnauthorized":true}`,
  },
});
