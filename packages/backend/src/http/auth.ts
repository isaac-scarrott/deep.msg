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
          return response.http({
            statusCode: 401,
            body: JSON.stringify({ error: "No email provided" }),
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
