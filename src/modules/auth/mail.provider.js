import nodemailer from 'nodemailer';

import { ServiceUnavailableError } from '../../common/errors/app-error.js';
import { getEnv } from '../../config/env.js';

export function createMailProvider(config = getEnv()) {
  const { smtp } = config;
  const enabled = Boolean(smtp.host && smtp.port && smtp.from);

  if (!enabled) {
    return {
      enabled: false,
      async sendEmailVerification() {
        throw new ServiceUnavailableError('이메일 발송 서비스가 설정되지 않았습니다.');
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
      try {
        await transporter.sendMail({
          from: smtp.from,
          to: email,
          subject: 'Minki email verification',
          text: `Your verification code is ${code}.`,
        });
      } catch {
        throw new ServiceUnavailableError(
          '이메일 인증번호 발송에 실패했습니다. 잠시 후 다시 시도해주세요.',
        );
      }

      return { sent: true };
    },
  };
}
