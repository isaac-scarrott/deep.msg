import { Config, StackContext } from "sst/constructs";

function config({ stack }: StackContext) {
  const parameters = Config.Parameter.create(stack, {
    GOOGLE_CLIENT_ID:
      "720061046431-6v1h5r9hvimnt26afupgn4b7dt29jids.apps.googleusercontent.com",
  });

  const secrets = Config.Secret.create(stack, "GOOGLE_CLIENT_SECRET");

  return { secrets, parameters };
}

export { config };
