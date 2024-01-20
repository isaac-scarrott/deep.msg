import { StackContext, use } from "sst/constructs";
import { Auth as SSTAuth } from "sst/constructs/future";

import { config as configStack } from "./config";

function auth({ stack }: StackContext) {
  const { secrets, parameters } = use(configStack);

  const auth = new SSTAuth(stack, "auth", {
    authenticator: {
      handler: "api/src/http/auth.handler",
      bind: [parameters.GOOGLE_CLIENT_ID, secrets.GOOGLE_CLIENT_SECRET],
    },
  });

  stack.addOutputs({ AuthUrl: auth.url });

  return auth;
}

export { auth };
