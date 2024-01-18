import { StackContext, StaticSite } from "sst/constructs";

function web({ stack }: StackContext) {
  const web = new StaticSite(stack, "web", {
    path: "packages/web",
    buildOutput: "dist",
    buildCommand: "npm run build",
    environment: {},
  });

  stack.addOutputs({
    web: web.url,
  });
}

export { web };
