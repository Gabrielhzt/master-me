import { Resend } from "resend";

import { env } from "../config/env.js";

const resend = new Resend(env.RESEND_API_KEY);

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
}) {
  const { error } = await resend.emails.send({
    from: env.EMAIL_FROM,
    ...opts,
  });

  if (error) {
    throw new Error(`Resend failed: ${error.message}`);
  }
}
