import { StackContext, StaticSite, use } from "sst/constructs";

import { auth as authStack } from "./auth";
import { api as apiStack } from "./api";
import { config as configStack } from "./config";

function web({ stack }: StackContext) {
  const auth = use(authStack);
  const api = use(apiStack);
  const { parameters } = use(configStack);

  const web = new StaticSite(stack, "web", {
    path: "packages/web",
    buildOutput: "dist",
    buildCommand: "npm run build",
    environment: {
      VITE_AUTH_URL: auth.url,
      VITE_API_URL: api.url,
      VITE_GOOGLE_CLIENT_ID: parameters.GOOGLE_CLIENT_ID.value,
      VITE_REPLICACHE_LICENSE_KEY: parameters.REPLICACHE_LICENSE_KEY.value,
    },
  });

  stack.addOutputs({
    WebEndpoint: web.url,
  });
}

export { web };
