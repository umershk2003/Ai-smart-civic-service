import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  User, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles,
  KeyRound,
  Building2,
  HardHat,
  ShieldAlert,
  UserCheck
} from 'lucide-react';
import { useAuth, DEMO_ACCOUNTS } from '../auth/AuthContext';
import { ExtendedUserRole } from '../types';

interface LoginPageProps {
  onLoginSuccess?: (role: ExtendedUserRole) => void;
  onBackToLanding?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onBackToLanding }) => {
  const { login, register, switchDemoRole } = useAuth();
  
  const [mode, setMode] = useState<'signin' | 'register'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<ExtendedUserRole>('citizen');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      if (mode === 'signin') {
        const res = login(email, password, rememberMe);
        setIsLoading(false);
        if (!res.success) {
          setError(res.error || 'Invalid email or password.');
        } else if (onLoginSuccess) {
          // get logged in role
          const found = DEMO_ACCOUNTS.find(a => a.email.toLowerCase() === email.toLowerCase());
          onLoginSuccess(found ? found.role : 'citizen');
        }
      } else {
        const res = register(name, email, password, role);
        setIsLoading(false);
        if (!res.success) {
          setError(res.error || 'Registration failed.');
        } else if (onLoginSuccess) {
          onLoginSuccess(role);
        }
      }
    }, 400);
  };

  const handleQuickDemoSelect = (demoEmail: string, demoPass: string, demoRole: ExtendedUserRole) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
    setMode('signin');

    // Auto sign-in
    setIsLoading(true);
    setTimeout(() => {
      const res = login(demoEmail, demoPass, true);
      setIsLoading(false);
      if (res.success && onLoginSuccess) {
        onLoginSuccess(demoRole);
      }
    }, 300);
  };

  const getRoleIcon = (r: ExtendedUserRole) => {
    switch (r) {
      case 'citizen': return <User className="w-3.5 h-3.5 text-emerald-400" />;
      case 'field_officer': return <HardHat className="w-3.5 h-3.5 text-amber-400" />;
      case 'supervisor': return <ShieldAlert className="w-3.5 h-3.5 text-blue-400" />;
      case 'municipal_admin': return <Building2 className="w-3.5 h-3.5 text-purple-400" />;
      case 'super_admin': return <KeyRound className="w-3.5 h-3.5 text-rose-400" />;
    }
  };

  const getRoleBadgeStyle = (r: ExtendedUserRole) => {
    switch (r) {
      case 'citizen': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'field_officer': return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'supervisor': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'municipal_admin': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'super_admin': return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Subtle Gradient Blobs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-600/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        
        {onBackToLanding && (
          <div className="flex justify-start">
            <button
              onClick={onBackToLanding}
              className="text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
            >
              <span>← Back to Home</span>
            </button>
          </div>
        )}

        {/* Logo & Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 text-white shadow-xl shadow-blue-500/20 ring-1 ring-white/20 mb-2">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            AI Smart Civic Services
          </h1>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Municipal Operations Management & RBAC Governance Platform
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 backdrop-blur-xl">
          
          {/* Sign In / Register Mode Switcher */}
          <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => { setMode('signin'); setError(null); }}
              className={`flex-1 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                mode === 'signin'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(null); }}
              className={`flex-1 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Validation Error Banner */}
          {error && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-start space-x-3 text-red-400 text-xs animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold">Authentication Failed</p>
                <p className="text-[11px] text-red-300/80 mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* Main Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name field (Register only) */}
            {mode === 'register' && (
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ahmed Khan"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  placeholder="e.g. admin@civic.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 p-0.5 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Role Field (Register Mode Only) */}
            {mode === 'register' && (
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Select System Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as ExtendedUserRole)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="citizen">Citizen / Resident</option>
                  <option value="field_officer">Field Officer</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="municipal_admin">Municipal Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
            )}

            {/* Remember Login Checkbox (Sign In mode) */}
            {mode === 'signin' && (
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center space-x-2 text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900 cursor-pointer"
                  />
                  <span>Remember login state</span>
                </label>
                <span className="text-[11px] text-blue-400 hover:underline cursor-pointer">
                  Demo Auth Mode
                </span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-2 transition-all cursor-pointer mt-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>{mode === 'signin' ? 'Sign In to Portal' : 'Create Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

        </div>

        {/* Quick Demo Login Section */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 space-y-3 backdrop-blur">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
              Demo Accounts Quick Access
            </span>
            <span className="text-[10px] text-slate-500 font-mono">1-Click Auto Login</span>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.email}
                type="button"
                onClick={() => handleQuickDemoSelect(acc.email, acc.password, acc.role)}
                className="w-full p-2.5 bg-slate-950 hover:bg-slate-800/80 border border-slate-800/80 hover:border-slate-700 rounded-xl transition-all flex items-center justify-between group cursor-pointer text-left"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="p-1.5 bg-slate-900 rounded-lg">
                    {getRoleIcon(acc.role)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white group-hover:text-blue-300">
                        {acc.name}
                      </span>
                      <span className={`px-1.5 py-0.2 text-[9px] font-mono border rounded ${getRoleBadgeStyle(acc.role)}`}>
                        {acc.role.replace('_', ' ')}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {acc.email} • pass: {acc.password}
                    </span>
                  </div>
                </div>

                <div className="px-2 py-1 bg-blue-600/10 group-hover:bg-blue-600 text-blue-400 group-hover:text-white border border-blue-500/30 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1">
                  <span>Sign In</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-[11px] text-slate-400">
          AI Smart Civic Operations • Local Demo Authentication System
        </p>

      </div>
    </div>
  );
};
