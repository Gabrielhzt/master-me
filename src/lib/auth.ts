import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { db } from "../db/index.js";
import { env } from "../config/env.js";
import { magicLink } from "better-auth/plugins";
import { sendEmail } from "./email.js";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  trustedOrigins: [env.CLIENT_URL],
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        await sendEmail({
          to: email,
          subject: "Sign in to master-me",
          html: `<p><a href="${url}">Click here to sign in</a></p>`,
        });
      },
    }),
  ],
});
