import { Request, Response } from 'express';
import { RegisterSchema, LoginSchema, PasswordResetRequestSchema, PasswordResetSchema } from 'shared';
import { AuthService } from '../services/auth.service';
import * as bcrypt from 'bcryptjs';

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const body = RegisterSchema.parse(req.body);
      const result = await AuthService.register(body);

      // Set cookie for refresh token
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return res.status(201).json({
        user: result.user,
        accessToken: result.accessToken,
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: error.errors[0].message });
      }
      return res.status(400).json({ error: error.message });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const body = LoginSchema.parse(req.body);
      const result = await AuthService.login(body.email, body.password);

      // Set cookie for refresh token
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return res.status(200).json({
        user: result.user,
        accessToken: result.accessToken,
      });
    } catch (error: any) {
      console.error('Error in AuthController.login:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: error.errors[0].message });
      }
      return res.status(400).json({ error: error.message });
    }
  }

  static async googleOAuth(req: Request, res: Response) {
    try {
      const { token } = req.body;
      if (!token) {
        return res.status(400).json({ error: 'Google ID token is required' });
      }

      const result = await AuthService.googleLogin(token);

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.status(200).json({
        user: result.user,
        accessToken: result.accessToken,
      });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  static async refresh(req: Request, res: Response) {
    try {
      const token = req.cookies.refreshToken || req.body.refreshToken;
      if (!token) {
        return res.status(401).json({ error: 'Refresh token is required' });
      }

      const result = await AuthService.refresh(token);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(401).json({ error: error.message });
    }
  }

  static async requestReset(req: Request, res: Response) {
    try {
      const body = PasswordResetRequestSchema.parse(req.body);
      const result = await AuthService.requestPasswordReset(body.email);
      return res.status(200).json(result);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: error.errors[0].message });
      }
      return res.status(400).json({ error: error.message });
    }
  }

  static async reset(req: Request, res: Response) {
    try {
      const body = PasswordResetSchema.parse(req.body);
      const hashed = await bcrypt.hash(body.password, 10);
      const result = await AuthService.resetPassword(body.token, hashed);
      return res.status(200).json(result);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: error.errors[0].message });
      }
      return res.status(400).json({ error: error.message });
    }
  }

  static async logout(req: Request, res: Response) {
    res.clearCookie('refreshToken');
    return res.status(200).json({ success: true, message: 'Logged out successfully' });
  }
}
