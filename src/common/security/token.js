import { createHash, randomBytes } from 'node:crypto';

import jwt from 'jsonwebtoken';

import { getEnv } from '../../config/env.js';

export function hashToken(token) {
  return createHash('sha256').update(token).digest('hex');
}

export function createOpaqueToken() {
  return randomBytes(48).toString('base64url');
}

export function signAccessToken(user) {
  const config = getEnv();
  return jwt.sign({ email: user.email }, config.accessTokenSecret, {
    subject: user.id,
    expiresIn: config.accessTokenExpiresIn,
  });
}

export function secondsFromDuration(value) {
  const match = /^(\d+)([smhd])?$/.exec(value);
  if (!match) return Number(value);

  const amount = Number(match[1]);
  const unit = match[2] ?? 's';
  const multipliers = { s: 1, m: 60, h: 3600, d: 86400 };
  return amount * multipliers[unit];
}

export function expiresAtFromNow(duration) {
  return new Date(Date.now() + secondsFromDuration(duration) * 1000);
}
