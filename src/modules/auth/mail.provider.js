import nodemailer from 'nodemailer';

import { getEnv } from '../../config/env.js';

export function createMailProvider(config = getEnv()) {
  const { smtp } = config;
  const enabled = Boolean(smtp.host && smtp.port && smtp.from);

  if (!enabled) {
    return {
      enabled: false,
      async sendEmailVerification() {
        return { skipped: true };
      },
    };
  }

  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    auth: smtp.user ? { user: smtp.user, pass: smtp.password } : undefined,
  });

  return {
    enabled: true,
    async sendEmailVerification({ email, code }) {
      await transporter.sendMail({
        from: smtp.from,
        to: email,
        subject: 'Minki email verification',
        text: `Your verification code is ${code}.`,
      });
      return { sent: true };
    },
  };
}
