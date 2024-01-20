import { StackContext, StaticSite, use } from "sst/constructs";

import { auth as authStack } from "./auth";
import { config as configStack } from "./config";

function web({ stack }: StackContext) {
  const auth = use(authStack);
  const { parameters } = use(configStack);

  const web = new StaticSite(stack, "web", {
    path: "web",
    buildOutput: "dist",
    buildCommand: "npm run build",
    environment: {
      VITE_AUTH_URL: auth.url,
      VITE_GOOGLE_CLIENT_ID: parameters.GOOGLE_CLIENT_ID.value,
    },
  });

  stack.addOutputs({
    WebEndpoint: web.url,
  });
}

export { web };
