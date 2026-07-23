import jwt from 'jsonwebtoken';

import { getEnv } from '../../config/env.js';

export function signAccessToken(user) {
  const config = getEnv();
  return jwt.sign({ email: user.email }, config.accessTokenSecret, {
    subject: user.id,
    expiresIn: config.accessTokenExpiresIn,
  });
}
