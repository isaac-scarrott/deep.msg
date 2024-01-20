import { AuthHandler, GoogleAdapter } from "sst/node/future/auth";
import { Config } from "sst/node/config";

import { sessions } from "../sessions";

export const handler = AuthHandler({
  sessions,
  providers: {
    google: GoogleAdapter({
      mode: "oidc",
      clientID: Config.GOOGLE_CLIENT_ID,
    }),
  },
  callbacks: {
    auth: {
      async success(input, response) {
        let email: string | undefined;

        if (input.provider === "google") {
          email = input.tokenset.claims().email;
        }

        if (!email) {
          response.http({
            status: 401,
            body: { error: "No email provided" },
          });
        }

        return response.session({
          type: "user",
          properties: { email },
        });
      },
      async allowClient() {
        return true;
      },
    },
  },
});
