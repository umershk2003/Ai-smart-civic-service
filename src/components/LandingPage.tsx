import React, { useState } from 'react';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Building2,
  HardHat,
  ShieldAlert,
  KeyRound,
  ArrowRight,
  Sparkles,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useAuth, DEMO_ACCOUNTS } from '../auth/AuthContext';
import { ExtendedUserRole } from '../types';
import { MarketingNavbar } from './marketing/MarketingNavbar';
import { Hero } from './marketing/Hero';
import { SocialProof } from './marketing/SocialProof';
import { Features } from './marketing/Features';
import { HowItWorks } from './marketing/HowItWorks';
import { Stats } from './marketing/Stats';
import { Testimonials } from './marketing/Testimonials';
import { FAQSection } from './marketing/FAQSection';
import { CTABand } from './marketing/CTABand';
import { MarketingFooter } from './marketing/MarketingFooter';
import { Modal } from './ui/Modal';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Tabs, TabItem } from './ui/Tabs';

interface LandingPageProps {
  onSignInSuccess?: (role: ExtendedUserRole) => void;
}

const getRoleIcon = (r: ExtendedUserRole) => {
  switch (r) {
    case 'citizen': return <User className="h-3.5 w-3.5 text-emerald-600" />;
    case 'field_officer': return <HardHat className="h-3.5 w-3.5 text-amber-600" />;
    case 'supervisor': return <ShieldAlert className="h-3.5 w-3.5 text-sky-600" />;
    case 'municipal_admin': return <Building2 className="h-3.5 w-3.5 text-violet-600" />;
    case 'super_admin': return <KeyRound className="h-3.5 w-3.5 text-rose-600" />;
  }
};

const getRoleBadgeStyle = (r: ExtendedUserRole) => {
  switch (r) {
    case 'citizen': return 'bg-emerald-50 text-emerald-700 ring-emerald-200';
    case 'field_officer': return 'bg-amber-50 text-amber-700 ring-amber-200';
    case 'supervisor': return 'bg-sky-50 text-sky-700 ring-sky-200';
    case 'municipal_admin': return 'bg-violet-50 text-violet-700 ring-violet-200';
    case 'super_admin': return 'bg-rose-50 text-rose-700 ring-rose-200';
  }
};

export const LandingPage: React.FC<LandingPageProps> = ({ onSignInSuccess }) => {
  const { login, register } = useAuth();

  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'register'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<ExtendedUserRole>('citizen');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const openAuth = (mode: 'signin' | 'register' = 'signin') => {
    setAuthMode(mode);
    setError(null);
    setSuccess(null);
    setAuthOpen(true);
  };

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      if (authMode === 'signin') {
        const res = login(email, password);
        setIsLoading(false);
        if (!res.success) {
          setError(res.error || 'Invalid email or password.');
        } else {
          const found = DEMO_ACCOUNTS.find((a) => a.email.toLowerCase() === email.trim().toLowerCase());
          setSuccess('Signed in successfully — redirecting…');
          setTimeout(() => {
            setAuthOpen(false);
            onSignInSuccess?.(found ? found.role : 'citizen');
          }, 350);
        }
      } else {
        const res = register(name, email, password, role);
        setIsLoading(false);
        if (!res.success) {
          setError(res.error || 'Registration failed.');
        } else {
          setSuccess('Account created — redirecting…');
          setTimeout(() => {
            setAuthOpen(false);
            onSignInSuccess?.(role);
          }, 350);
        }
      }
    }, 400);
  };

  const handleQuickDemoSelect = (demoEmail: string, demoPass: string, demoRole: ExtendedUserRole) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    setTimeout(() => {
      const res = login(demoEmail, demoPass);
      setIsLoading(false);
      if (res.success) {
        setSuccess(`Signed in as ${demoRole.replace('_', ' ')} — redirecting…`);
        setTimeout(() => {
          setAuthOpen(false);
          onSignInSuccess?.(demoRole);
        }, 350);
      } else {
        setError(res.error || 'Demo login failed.');
      }
    }, 300);
  };

  const authTabs: TabItem[] = [
    {
      id: 'signin',
      label: 'Sign in',
      content: (
        <SignInForm
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          isLoading={isLoading}
          onSubmit={handleSubmit}
          onQuickDemo={handleQuickDemoSelect}
        />
      ),
    },
    {
      id: 'register',
      label: 'Create account',
      content: (
        <RegisterForm
          name={name}
          setName={setName}
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          role={role}
          setRole={setRole}
          isLoading={isLoading}
          onSubmit={handleSubmit}
        />
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      <MarketingNavbar onSignIn={() => openAuth('signin')} />
      <main>
        <Hero onSignIn={() => openAuth('signin')} onSeeHowItWorks={() => scrollTo('how-it-works')} />
        <SocialProof />
        <Features />
        <HowItWorks />
        <Stats />
        <Testimonials />
        <FAQSection />
        <CTABand onSignIn={() => openAuth('signin')} />
      </main>
      <MarketingFooter />

      {/* Auth Modal */}
      <Modal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        title="Welcome to AI Smart Civic"
        description="Sign in to your workspace or explore with a demo account."
        maxWidth="md"
      >
        {error && (
          <div
            role="alert"
            className="mb-5 flex items-start gap-2.5 rounded-xl bg-red-50 p-3.5 text-sm text-red-700 ring-1 ring-inset ring-red-200"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <p className="font-medium">{error}</p>
          </div>
        )}
        {success && (
          <div
            role="status"
            className="mb-5 flex items-start gap-2.5 rounded-xl bg-emerald-50 p-3.5 text-sm text-emerald-700 ring-1 ring-inset ring-emerald-200"
          >
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <p className="font-medium">{success}</p>
          </div>
        )}

        <Tabs
          tabs={authTabs}
          activeId={authMode}
          onChange={(id) => {
            setAuthMode(id as 'signin' | 'register');
            setError(null);
            setSuccess(null);
          }}
          label="Authentication mode"
        />
      </Modal>
    </div>
  );
};

/* ---------------------------------- forms --------------------------------- */

interface SignInFormProps {
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onQuickDemo: (email: string, pass: string, role: ExtendedUserRole) => void;
}

const SignInForm: React.FC<SignInFormProps> = ({
  email,
  setEmail,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  isLoading,
  onSubmit,
  onQuickDemo,
}) => (
  <div>
    <form onSubmit={onSubmit} className="space-y-4">
      <Input
        label="Email address"
        type="email"
        placeholder="e.g. admin@civic.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        icon={<Mail className="h-4 w-4" />}
        required
        autoComplete="email"
      />
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
          Password <span className="ml-0.5 text-primary-600">*</span>
        </label>
        <div className="relative">
          <span aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            <Lock className="h-4 w-4" />
          </span>
          <input
            type={showPassword ? 'text' : 'password'}
            required
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-11 w-full rounded-xl border-0 bg-white pl-10 pr-11 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 transition-shadow placeholder:text-slate-400 focus:ring-2 focus:ring-primary-500"
          />
          <button
            type="button"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition-colors hover:text-slate-700 cursor-pointer"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <Button type="submit" fullWidth loading={isLoading} rightIcon={<ArrowRight className="h-4 w-4" />}>
        {isLoading ? 'Signing in…' : 'Sign in'}
      </Button>
    </form>

    <div className="mt-6 border-t border-slate-100 pt-5">
      <p className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
        <Sparkles className="h-3.5 w-3.5 text-amber-500" aria-hidden="true" />
        Explore with a demo account
      </p>
      <div className="space-y-1.5">
        {DEMO_ACCOUNTS.map((acc) => (
          <button
            key={acc.email}
            type="button"
            aria-label={`Sign in as demo account ${acc.name}, role ${acc.role.replace('_', ' ')}`}
            onClick={() => onQuickDemo(acc.email, acc.password, acc.role)}
            disabled={isLoading}
            className="group flex w-full items-center justify-between rounded-xl p-2.5 text-left ring-1 ring-inset ring-slate-200 transition-all hover:bg-slate-50 hover:ring-primary-300 disabled:opacity-60 cursor-pointer"
          >
            <span className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-50 ring-1 ring-inset ring-slate-200">
                {getRoleIcon(acc.role)}
              </span>
              <span>
                <span className="block text-sm font-semibold text-slate-800 group-hover:text-primary-700">
                  {acc.name}
                </span>
                <span className={`mt-0.5 inline-block rounded-full px-1.5 py-0.5 text-[10px] font-bold capitalize ring-1 ring-inset ${getRoleBadgeStyle(acc.role)}`}>
                  {acc.role.replace('_', ' ')}
                </span>
              </span>
            </span>
            <span className="text-xs font-semibold text-primary-600 opacity-0 transition-opacity group-hover:opacity-100">
              Login →
            </span>
          </button>
        ))}
      </div>
    </div>
  </div>
);

interface RegisterFormProps {
  name: string;
  setName: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
  role: ExtendedUserRole;
  setRole: (v: ExtendedUserRole) => void;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({
  name,
  setName,
  email,
  setEmail,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  role,
  setRole,
  isLoading,
  onSubmit,
}) => (
  <form onSubmit={onSubmit} className="space-y-4">
    <Input
      label="Full name"
      type="text"
      placeholder="e.g. Ahmed Khan"
      value={name}
      onChange={(e) => setName(e.target.value)}
      icon={<User className="h-4 w-4" />}
      required
      autoComplete="name"
    />
    <Input
      label="Email address"
      type="email"
      placeholder="e.g. admin@civic.com"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      icon={<Mail className="h-4 w-4" />}
      required
      autoComplete="email"
    />
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
        Password <span className="ml-0.5 text-primary-600">*</span>
      </label>
      <div className="relative">
        <span aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
          <Lock className="h-4 w-4" />
        </span>
        <input
          type={showPassword ? 'text' : 'password'}
          required
          minLength={6}
          autoComplete="new-password"
          placeholder="At least 6 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-11 w-full rounded-xl border-0 bg-white pl-10 pr-11 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 transition-shadow placeholder:text-slate-400 focus:ring-2 focus:ring-primary-500"
        />
        <button
          type="button"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition-colors hover:text-slate-700 cursor-pointer"
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
    <div className="space-y-1.5">
      <label htmlFor="register-role" className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
        I am a…
      </label>
      <select
        id="register-role"
        value={role}
        onChange={(e) => setRole(e.target.value as ExtendedUserRole)}
        className="h-11 w-full cursor-pointer rounded-xl border-0 bg-white px-3.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 transition-shadow focus:ring-2 focus:ring-primary-500"
      >
        <option value="citizen">Citizen / Resident</option>
        <option value="field_officer">Field Officer</option>
        <option value="supervisor">Supervisor</option>
        <option value="municipal_admin">Municipal Admin</option>
        <option value="super_admin">Super Admin</option>
      </select>
    </div>

    <Button type="submit" fullWidth loading={isLoading} rightIcon={<ArrowRight className="h-4 w-4" />}>
      {isLoading ? 'Creating account…' : 'Create account'}
    </Button>
    <p className="text-center text-xs text-slate-500">
      By continuing you agree to our Terms of Service and Privacy Policy.
    </p>
  </form>
);
