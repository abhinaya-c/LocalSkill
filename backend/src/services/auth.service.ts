import { UserRepository } from '../repositories/user.repository';
import { AuditRepository } from '../repositories/audit.repository';
import { JWTUtils } from '../utils/jwt';
import * as bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import { UserRole } from 'shared';
import * as jwt from 'jsonwebtoken';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const RESET_SECRET = process.env.JWT_RESET_SECRET || 'super_secret_reset_key_789_ghi!';

export class AuthService {
  static async register(data: {
    name: string;
    email: string;
    phone?: string;
    password?: string;
    role: UserRole;
    avatarUrl?: string;
  }) {
    const existing = await UserRepository.findByEmail(data.email);
    if (existing) {
      throw new Error('Email is already registered');
    }

    const passwordHash = await bcrypt.hash(data.password || 'OAuthPassword123!', 10);
    const user = await UserRepository.create({
      name: data.name,
      email: data.email,
      phone: data.phone,
      passwordHash,
      role: data.role,
      avatarUrl: data.avatarUrl,
    });

    const accessToken = JWTUtils.generateAccessToken(user.id, user.role);
    const refreshToken = JWTUtils.generateRefreshToken(user.id);

    await AuditRepository.createLog({
      userId: user.id,
      action: 'USER_REGISTER',
      details: `Registered as ${user.role}`,
    });

    return { user: { id: user.id, name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl }, accessToken, refreshToken };
  }

  static async login(email: string, password?: string) {
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    if (password) {
      const match = await bcrypt.compare(password, user.passwordHash);
      if (!match) {
        throw new Error('Invalid email or password');
      }
    }

    const accessToken = JWTUtils.generateAccessToken(user.id, user.role);
    const refreshToken = JWTUtils.generateRefreshToken(user.id);

    await AuditRepository.createLog({
      userId: user.id,
      action: 'USER_LOGIN',
      details: 'Logged in successfully',
    });

    return { user: { id: user.id, name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl }, accessToken, refreshToken };
  }

  static async googleLogin(idToken: string) {
    let email = '';
    let name = '';
    let avatarUrl = '';

    try {
      if (process.env.GOOGLE_CLIENT_ID) {
        const ticket = await googleClient.verifyIdToken({
          idToken,
          audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload || !payload.email || !payload.name) {
          throw new Error('Invalid Google token payload');
        }
        email = payload.email;
        name = payload.name;
        avatarUrl = payload.picture || '';
      } else {
        // Mock Google Verification for testing/dev environments
        console.warn('Google client ID not set. Verification bypassed for dev convenience.');
        const decoded = jwt.decode(idToken) as any;
        if (decoded && decoded.email && decoded.name) {
          email = decoded.email;
          name = decoded.name;
          avatarUrl = decoded.picture || '';
        } else {
          // If token is just a raw email/name JSON string, parse it
          try {
            const parsed = JSON.parse(idToken);
            email = parsed.email || 'google-user@example.com';
            name = parsed.name || 'Google User';
            avatarUrl = parsed.picture || '';
          } catch {
            email = 'mock-google-user@localskill.com';
            name = 'Mock Google User';
          }
        }
      }

      // Check if user exists
      let user: any = await UserRepository.findByEmail(email);
      let isNew = false;
      if (!user) {
        // Create user with default CUSTOMER role
        const passwordHash = await bcrypt.hash(Math.random().toString(36), 10);
        user = await UserRepository.create({
          name,
          email,
          passwordHash,
          role: 'CUSTOMER',
          avatarUrl,
        });
        isNew = true;
      }

      const accessToken = JWTUtils.generateAccessToken(user.id, user.role);
      const refreshToken = JWTUtils.generateRefreshToken(user.id);

      await AuditRepository.createLog({
        userId: user.id,
        action: isNew ? 'USER_REGISTER_GOOGLE' : 'USER_LOGIN_GOOGLE',
        details: isNew ? 'Registered via Google OAuth' : 'Logged in via Google OAuth',
      });

      return { user: { id: user.id, name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl }, accessToken, refreshToken };

    } catch (e: any) {
      throw new Error(`Google OAuth error: ${e.message}`);
    }
  }

  static async refresh(token: string) {
    try {
      const decoded = JWTUtils.verifyRefreshToken(token);
      const user = await UserRepository.findById(decoded.userId);
      if (!user) {
        throw new Error('User not found');
      }

      const accessToken = JWTUtils.generateAccessToken(user.id, user.role);
      return { accessToken };
    } catch {
      throw new Error('Invalid or expired refresh token');
    }
  }

  static async requestPasswordReset(email: string) {
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      throw new Error('Email not found');
    }

    // Generate reset token valid for 30m
    const resetToken = jwt.sign({ userId: user.id }, RESET_SECRET, { expiresIn: '30m' });
    
    // In a real app, send mail here. We log it for dev convenience:
    console.log(`[EMAIL SEND] To: ${email} | Password Reset Link: http://localhost:5173/reset-password?token=${resetToken}`);

    await AuditRepository.createLog({
      userId: user.id,
      action: 'PASSWORD_RESET_REQUEST',
      details: 'Password reset email triggered',
    });

    return { success: true, message: 'Reset email triggered.', resetToken }; // Return token for dev accessibility
  }

  static async resetPassword(token: string, newPasswordHash: string) {
    try {
      const decoded = jwt.verify(token, RESET_SECRET) as { userId: string };
      const user = await UserRepository.findById(decoded.userId);
      if (!user) {
        throw new Error('User not found');
      }

      await UserRepository.update(user.id, { passwordHash: newPasswordHash });

      await AuditRepository.createLog({
        userId: user.id,
        action: 'PASSWORD_RESET_SUCCESS',
        details: 'Password successfully changed',
      });

      return { success: true };
    } catch {
      throw new Error('Invalid or expired reset token');
    }
  }
}
