import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Chrome } from 'lucide-react';
import { LoginSchema, RegisterSchema, UserRole } from 'shared';
import { useAuthStore } from '../store/useAuthStore';
import { apiFetch } from '../api/client';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export const Auth: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const initialTab = searchParams.get('tab') === 'register' ? 'register' : 'login';
  const [tab, setTab] = useState<'login' | 'register'>(initialTab);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Zod validation with react-hook-form
  const loginForm = useForm({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: '', password: '' },
  });

  const registerForm = useForm({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'CUSTOMER' as UserRole,
      phone: '',
    },
  });

  const onLoginSubmit = async (data: any) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const response = await apiFetch('/api/auth/login', {
        method: 'POST',
        json: data,
      });
      setAuth(response.user, response.accessToken);
      navigate('/');
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const onRegisterSubmit = async (data: any) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const response = await apiFetch('/api/auth/register', {
        method: 'POST',
        json: data,
      });
      setAuth(response.user, response.accessToken);
      navigate('/');
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      // Mock Google ID Token containing user info
      const mockGoogleToken = JSON.stringify({
        email: 'google-user@example.com',
        name: 'Google User',
        picture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      });

      const response = await apiFetch('/api/auth/google', {
        method: 'POST',
        json: { token: mockGoogleToken },
      });
      setAuth(response.user, response.accessToken);
      navigate('/');
    } catch (err: any) {
      setErrorMsg(err.message || 'Google OAuth failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 relative">
      {/* Background radial overlay */}
      <div className="absolute inset-0 bg-slate-950/20 z-0 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl overflow-hidden shadow-2xl z-10 flex flex-col p-8"
      >
        {/* Toggle tabs */}
        <div className="flex bg-slate-950 rounded-lg p-1 mb-6 border border-slate-800/60">
          <button
            onClick={() => {
              setTab('login');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold uppercase tracking-wider rounded-md transition-all ${
              tab === 'login' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Log In
          </button>
          <button
            onClick={() => {
              setTab('register');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold uppercase tracking-wider rounded-md transition-all ${
              tab === 'register' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Register
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-lg px-4 py-2.5 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        {/* Login Form */}
        {tab === 'login' && (
          <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="flex flex-col gap-4">
            <Input
              type="email"
              label="Email Address"
              placeholder="name@example.com"
              error={loginForm.formState.errors.email?.message}
              {...loginForm.register('email')}
            />
            <Input
              type="password"
              label="Password"
              placeholder="••••••••"
              error={loginForm.formState.errors.password?.message}
              {...loginForm.register('password')}
            />
            <Button type="submit" className="w-full mt-2" isLoading={isLoading}>
              Sign In
            </Button>
          </form>
        )}

        {/* Register Form */}
        {tab === 'register' && (
          <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="flex flex-col gap-4">
            <Input
              type="text"
              label="Full Name"
              placeholder="Hari Shrestha"
              error={registerForm.formState.errors.name?.message}
              {...registerForm.register('name')}
            />
            <Input
              type="email"
              label="Email Address"
              placeholder="name@example.com"
              error={registerForm.formState.errors.email?.message}
              {...registerForm.register('email')}
            />
            <Input
              type="tel"
              label="Phone Number"
              placeholder="+9779812345678"
              error={registerForm.formState.errors.phone?.message}
              {...registerForm.register('phone')}
            />
            <Input
              type="password"
              label="Password"
              placeholder="••••••••"
              error={registerForm.formState.errors.password?.message}
              {...registerForm.register('password')}
            />

            {/* Role Radio selection */}
            <div className="flex flex-col gap-2 mt-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Account Role</label>
              <div className="flex gap-4">
                <label className="flex-1 flex items-center justify-between border border-slate-800 bg-slate-950/40 rounded-lg p-3 cursor-pointer hover:border-indigo-500/30 transition-all">
                  <span className="text-xs font-medium text-slate-200">Customer</span>
                  <input
                    type="radio"
                    value="CUSTOMER"
                    className="accent-indigo-500"
                    {...registerForm.register('role')}
                  />
                </label>
                <label className="flex-1 flex items-center justify-between border border-slate-800 bg-slate-950/40 rounded-lg p-3 cursor-pointer hover:border-indigo-500/30 transition-all">
                  <span className="text-xs font-medium text-slate-200">Provider</span>
                  <input
                    type="radio"
                    value="PROVIDER"
                    className="accent-indigo-500"
                    {...registerForm.register('role')}
                  />
                </label>
              </div>
            </div>

            <Button type="submit" className="w-full mt-2" isLoading={isLoading}>
              Create Account
            </Button>
          </form>
        )}

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-800/80" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-slate-900 px-3.5 text-slate-500 font-semibold tracking-wider">Or continue with</span>
          </div>
        </div>

        {/* Google OAuth Button */}
        <Button
          type="button"
          variant="outline"
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-2 border-slate-800 hover:bg-slate-800"
          disabled={isLoading}
        >
          <Chrome className="h-4 w-4 text-indigo-400" />
          Google Account
        </Button>
      </motion.div>
    </div>
  );
};
