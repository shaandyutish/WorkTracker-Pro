import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckSquare, Eye, EyeOff, LogIn, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage = () => {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // If already authenticated redirect
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') navigate('/admin/dashboard', { replace: true });
      else navigate('/employee/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.email.trim() || !form.password.trim()) {
      setError('Please enter both email and password.');
      return;
    }
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    const result = login(form.email, form.password);
    setIsLoading(false);
    if (result.success) {
      // Navigation handled by useEffect above
    } else {
      setError(result.error || 'Login failed.');
    }
  };

  const fillDemo = (type: 'admin' | 'employee') => {
    if (type === 'admin') setForm({ email: 'admin@taskflow.com', password: 'admin123' });
    else setForm({ email: 'james@taskflow.com', password: 'emp123' });
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900 flex items-center justify-center p-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-violet-600 to-violet-700 px-8 py-8 text-center">
            <div className="inline-flex w-16 h-16 rounded-2xl bg-white/20 items-center justify-center mb-4">
              <CheckSquare size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">TaskFlow</h1>
            <p className="text-violet-200 text-sm mt-1">Task Management System</p>
          </div>

          {/* Form */}
          <div className="px-8 py-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-1">Welcome back</h2>
            <p className="text-slate-400 text-sm mb-6">Sign in to your account to continue</p>

            {error && (
              <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex items-center gap-2">
                <span className="flex-shrink-0">⚠️</span>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-colors"
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                    className="w-full px-4 py-3 pr-12 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-colors"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn size={18} />
                    Sign In
                  </>
                )}
              </button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-6 pt-5 border-t border-slate-100">
              <div className="flex items-center gap-2 mb-3">
                <Shield size={14} className="text-slate-400" />
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Demo Accounts — Click to fill
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => fillDemo('admin')}
                  className="flex flex-col items-start p-3.5 rounded-xl border-2 border-violet-200 bg-violet-50 hover:bg-violet-100 hover:border-violet-300 transition-all text-left"
                >
                  <span className="text-xs font-bold text-violet-700 mb-1">⚡ Admin</span>
                  <span className="text-xs text-violet-600 font-medium">admin@taskflow.com</span>
                  <span className="text-xs text-violet-400 mt-0.5">Password: admin123</span>
                </button>
                <button
                  type="button"
                  onClick={() => fillDemo('employee')}
                  className="flex flex-col items-start p-3.5 rounded-xl border-2 border-blue-200 bg-blue-50 hover:bg-blue-100 hover:border-blue-300 transition-all text-left"
                >
                  <span className="text-xs font-bold text-blue-700 mb-1">👤 Employee</span>
                  <span className="text-xs text-blue-600 font-medium">james@taskflow.com</span>
                  <span className="text-xs text-blue-400 mt-0.5">Password: emp123</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-slate-500 text-xs mt-4">
          TaskFlow © 2025 — Secure Task Management Platform
        </p>
      </div>
    </div>
  );
};
