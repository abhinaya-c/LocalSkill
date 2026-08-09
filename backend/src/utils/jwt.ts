import * as jwt from 'jsonwebtoken';
import { UserRole } from 'shared';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'super_secret_access_key_123_abc!';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'super_secret_refresh_key_456_def!';

export interface AccessTokenPayload {
  userId: string;
  role: UserRole;
}

export interface RefreshTokenPayload {
  userId: string;
}

export class JWTUtils {
  static generateAccessToken(userId: string, role: UserRole): string {
    return jwt.sign({ userId, role }, ACCESS_SECRET, { expiresIn: '15m' });
  }

  static generateRefreshToken(userId: string): string {
    return jwt.sign({ userId }, REFRESH_SECRET, { expiresIn: '7d' });
  }

  static verifyAccessToken(token: string): AccessTokenPayload {
    return jwt.verify(token, ACCESS_SECRET) as AccessTokenPayload;
  }

  static verifyRefreshToken(token: string): RefreshTokenPayload {
    return jwt.verify(token, REFRESH_SECRET) as RefreshTokenPayload;
  }
}
