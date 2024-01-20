import { createSessionBuilder } from "sst/node/future/auth";

const sessions = createSessionBuilder<{
  user: {
    email: string;
  };
}>();

export { sessions };
