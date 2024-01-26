import { StackContext, Api, use } from "sst/constructs";

import { auth as authStack } from "./auth";
import { config as configStack } from "./config";

function api({ stack }: StackContext) {
  const auth = use(authStack);
  const { secrets, parameters } = use(configStack);

  const api = new Api(stack, "api", {
    defaults: {
      function: {
        bind: [
          auth,
          secrets.DATABASE_USERNAME,
          secrets.DATABASE_PASSWORD,
          parameters.DATABASE_HOST,
        ],
        timeout: "30 seconds",
      },
    },
    routes: {
      "POST /replicache/pull":
        "packages/backend/src/http/replicache/pull.handler",
      "POST /replicache/push":
        "packages/backend/src/http/replicache/push.handler",
    },
  });

  stack.addOutputs({
    ApiEndpoint: api.customDomainUrl,
  });

  return api;
}

export { api };
