import { SSTConfig } from "sst";

import { web } from "./stacks/web";

export default {
  config(_input) {
    return {
      name: "deepmsg",
      region: "eu-west-2",
    };
  },
  stacks(app) {
    app.stack(web);
  },
} satisfies SSTConfig;
