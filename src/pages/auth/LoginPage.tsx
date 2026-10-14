import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Mail, Lock, Eye, EyeOff, ArrowRight, Wifi, Activity, BarChart3 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../hooks/useAuth';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, demoAccounts, isAuthenticated, currentUser } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // If already logged in, redirect to respective dashboard
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      if (currentUser.role === 'ADMIN') navigate('/admin/dashboard', { replace: true });
      else if (currentUser.role === 'BILLING_CLERK') navigate('/clerk/dashboard', { replace: true });
      else if (currentUser.role === 'CONSUMER') navigate('/consumer/dashboard', { replace: true });
    }
  }, [isAuthenticated, currentUser, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);
      if (result.success && result.defaultPath) {
        navigate(result.defaultPath);
      } else {
        setError(result.error || 'Invalid email or password.');
      }
    } catch {
      setError('Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
    setLoading(true);

    try {
      const result = await login(demoEmail, demoPass);
      if (result.success && result.defaultPath) {
        navigate(result.defaultPath);
      } else {
        setError(result.error || 'Invalid email or password.');
      }
    } catch {
      setError('Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left: Branding panel */}
      <div className="hidden lg:flex flex-col w-[480px] bg-black relative overflow-hidden shrink-0">
        {/* Background pattern */}
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, #3ECF6A 1px, transparent 0)',
              backgroundSize: '32px 32px',
            }}
          />
          <div className="absolute top-1/4 -left-20 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
        </div>

        <div className="relative flex flex-col h-full px-10 py-10">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center">
              <Zap size={20} className="text-black" fill="currentColor" />
            </div>
            <div>
              <span className="block text-xs font-bold text-white tracking-widest uppercase leading-none">Smart</span>
              <span className="block text-xs font-bold text-accent tracking-widest uppercase leading-none mt-0.5">Billing</span>
            </div>
          </div>

          {/* Main tagline */}
          <div className="mt-auto mb-8">
            <h2 className="text-4xl font-bold text-white leading-snug tracking-tight">
              Smart Electricity<br />
              <span className="text-accent">Billing</span> System
            </h2>
            <p className="text-gray-400 mt-4 text-sm leading-relaxed max-w-xs">
              Record consumption, calculate bills, process payments and generate monthly reports — all in one platform.
            </p>

            {/* Feature chips */}
            <div className="mt-6 flex flex-col gap-3">
              {[
                { icon: <Activity size={14} />, text: 'Real-time consumption tracking' },
                { icon: <BarChart3 size={14} />, text: 'Automated tariff-slab billing' },
                { icon: <Wifi size={14} />, text: 'Smart meter integration ready' },
              ].map(f => (
                <div key={f.text} className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-accent/10 rounded-md flex items-center justify-center text-accent shrink-0">
                    {f.icon}
                  </div>
                  <span className="text-gray-400 text-sm">{f.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-6">
            {[
              { label: 'Consumers', value: '12,482' },
              { label: 'Bills/Month', value: '1,362' },
              { label: 'Revenue', value: '₹24.8L' },
            ].map(s => (
              <div key={s.label}>
                <p className="text-lg font-bold text-white">{s.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Login form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-sm">
          {/* Mobile brand */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <Zap size={16} className="text-accent" fill="currentColor" />
            </div>
            <span className="font-bold text-gray-900 text-sm tracking-wide uppercase">Smart Billing</span>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Welcome back</h1>
            <p className="text-sm text-gray-500 mt-1">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleLogin} className="mt-7 space-y-4" noValidate>
            <Input
              label="Email / Username"
              type="email"
              id="login-email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
              icon={<Mail size={14} />}
            />

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              id="login-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
              icon={<Lock size={14} />}
              iconRight={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              }
            />

            {error && (
              <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-md px-3 py-2" role="alert">
                {error}
              </p>
            )}

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  id="remember-me"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded accent-accent"
                />
                <span className="text-xs text-gray-600">Remember me</span>
              </label>
              <button type="button" className="text-xs text-accent hover:underline font-medium">
                Forgot Password?
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full mt-2"
              id="login-submit-btn"
            >
              {!loading && <>Sign In <ArrowRight size={15} /></>}
              {loading && 'Signing in...'}
            </Button>
          </form>

          {/* Demo accounts */}
          <div className="mt-6 border-t border-gray-200 pt-5">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-3">
              Demo Accounts
            </p>
            <div className="grid grid-cols-3 gap-2">
              {demoAccounts.map(a => (
                <button
                  key={a.user.role}
                  type="button"
                  onClick={() => handleQuickLogin(a.email, a.password)}
                  className="flex flex-col items-center px-2 py-2.5 rounded-lg border border-gray-200 hover:border-accent hover:bg-accent-muted transition-all duration-150 group"
                  title={`Login as ${a.label}`}
                  id={`quick-login-${a.user.role.toLowerCase()}`}
                >
                  <span className="text-xs font-semibold text-gray-700 group-hover:text-accent transition-colors">{a.label}</span>
                  <span className="text-[10px] text-gray-400 mt-0.5 truncate w-full text-center">{a.email.split('@')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-gray-400">
            Don't have an account?{' '}
            <span className="text-gray-600 font-medium">Contact Admin</span>
          </p>
        </div>
      </div>
    </div>
  );
};
