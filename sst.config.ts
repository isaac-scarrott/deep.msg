import { SSTConfig } from "sst";

import { web } from "./stacks/web";
import { config } from "./stacks/config";
import { auth } from "./stacks/auth";
import { api } from "./stacks/api";

export default {
  config(_input) {
    return {
      name: "deepmsg",
      region: "eu-west-2",
    };
  },
  stacks(app) {
    app.stack(config).stack(auth).stack(api).stack(web);
  },
} satisfies SSTConfig;
