import { Config, StackContext } from "sst/constructs";

function config({ stack }: StackContext) {
  const parameters = Config.Parameter.create(stack, {
    GOOGLE_CLIENT_ID:
      "720061046431-6v1h5r9hvimnt26afupgn4b7dt29jids.apps.googleusercontent.com",
    REPLICACHE_LICENSE_KEY: "l7770218825c947c4a3f42996ade22ee0",
    DATABASE_HOST: "aws.connect.psdb.cloud",
  });

  const secrets = Config.Secret.create(
    stack,
    "GOOGLE_CLIENT_SECRET",
    "DATABASE_USERNAME",
    "DATABASE_PASSWORD",
  );

  return { secrets, parameters };
}

export { config };
