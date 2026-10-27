import jwt from 'jsonwebtoken';
import { Response, CookieOptions } from 'express';
import { config } from '../config/index.js';

export interface TokenPayload {
  userId: string;
  email: string;
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn as any,
  });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, config.jwtSecret) as TokenPayload;
  } catch (err) {
    return null;
  }
}

export const COOKIE_NAME = 'interviewlab_session';

export function getCookieOptions(): CookieOptions {
  const isProd = config.nodeEnv === 'production';
  return {
    httpOnly: true,
    secure: config.cookieSecure || isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
    domain: config.cookieDomain,
  };
}

export function setAuthCookie(res: Response, token: string): void {
  res.cookie(COOKIE_NAME, token, getCookieOptions());
}

export function clearAuthCookie(res: Response): void {
  res.clearCookie(COOKIE_NAME, {
    ...getCookieOptions(),
    maxAge: 0,
  });
}
