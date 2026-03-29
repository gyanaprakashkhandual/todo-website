import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  CheckSquare,
  Loader2,
  GitBranchPlus,
} from 'lucide-react';
import { useAuth } from '../../context/Auth.context';
import { API_CONFIG, API_ENDPOINTS } from '../../configs/config';
import type { AuthMode } from '../../types';
import ThemeToggle from '../../assets/Theme.toggle';

// ─── Google icon SVG ───────────────────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

// ─── Feature list item ─────────────────────────────────────────────────────────
function Feature({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-gray-900 dark:bg-white flex items-center justify-center">
        <ArrowRight className="w-3 h-3 text-white dark:text-gray-900" />
      </span>
      <span className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{text}</span>
    </li>
  );
}

// ─── Input field ───────────────────────────────────────────────────────────────
interface InputFieldProps {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  icon: React.ReactNode;
  rightElement?: React.ReactNode;
  autoComplete?: string;
}

function InputField({
  label,
  type,
  value,
  onChange,
  placeholder,
  icon,
  rightElement,
  autoComplete,
}: InputFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
          {icon}
        </span>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required
          className="w-full pl-10 pr-10 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent transition-all"
        />
        {rightElement && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2">{rightElement}</span>
        )}
      </div>
    </div>
  );
}

// ─── Social button ─────────────────────────────────────────────────────────────
function SocialButton({
  onClick,
  icon,
  label,
  disabled,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  disabled?: boolean;
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      disabled={disabled}
      className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-medium border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {icon}
      {label}
    </motion.button>
  );
}

// ─── Main AuthPage ─────────────────────────────────────────────────────────────
export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login, register } = useAuth();

  const switchMode = (m: AuthMode) => {
    setMode(m);
    setError('');
    setSuccessMsg('');
    setShowPassword(false);
    setShowConfirm(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('All fields are required'); return; }
    setIsLoading(true);
    try {
      await login({ email, password });
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e?.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name || !email || !password || !confirmPassword) {
      setError('All fields are required'); return;
    }
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setIsLoading(true);
    try {
      await register({ name, email, password });
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email) { setError('Email is required'); return; }
    setIsLoading(true);
    // Simulate — backend endpoint not in spec, show success
    await new Promise((r) => setTimeout(r, 1000));
    setIsLoading(false);
    setSuccessMsg('If that email exists, a reset link has been sent.');
    setEmail('');
  };

  const handleOAuth = (provider: 'google' | 'github') => {
    const endpoint =
      provider === 'google'
        ? API_ENDPOINTS.AUTH.GOOGLE_LOGIN
        : API_ENDPOINTS.AUTH.GITHUB_LOGIN;
    window.location.href = `${API_CONFIG.BASE_URL}${endpoint}`;
  };

  const submitHandler =
    mode === 'login'
      ? handleLogin
      : mode === 'register'
      ? handleRegister
      : handleForgotPassword;

  const EyeToggle = ({
    show,
    onToggle,
  }: {
    show: boolean;
    onToggle: () => void;
  }) => (
    <button
      type="button"
      onClick={onToggle}
      className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
    >
      {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
    </button>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-5 h-5 text-gray-900 dark:text-white" />
          <span className="font-semibold text-gray-900 dark:text-white tracking-tight">TodoApp</span>
        </div>
        <ThemeToggle />
      </header>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-5xl flex flex-col lg:flex-row items-center gap-16">

          {/* ── Left: Hero ── */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex-1 max-w-md"
          >
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-xs font-medium text-gray-600 dark:text-gray-400 mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                Spring Boot + PostgreSQL backend
              </div>
              <h1 className="font-display text-4xl lg:text-5xl text-gray-900 dark:text-white leading-tight mb-4">
                Your tasks,<br />
                <span className="italic text-gray-400 dark:text-gray-600">beautifully</span> managed.
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                A clean, secure todo application backed by JWT authentication,
                OAuth2 social login, and a production-grade Spring Boot API.
              </p>
            </div>

            <ul className="space-y-3.5">
              {[
                'JWT-based authentication with 24-hour token expiry',
                'Sign in instantly with Google or GitHub OAuth2',
                'Persistent login — stay signed in across sessions',
                'Full CRUD for todos with completion tracking',
              ].map((f) => (
                <Feature key={f} text={f} />
              ))}
            </ul>

            {/* Stats */}
            <div className="mt-10 pt-8 border-t border-gray-100 dark:border-gray-800 grid grid-cols-3 gap-6">
              {[
                { value: 'JWT', label: 'Auth method' },
                { value: '24h', label: 'Token lifetime' },
                { value: 'BCrypt', label: 'Password hash' },
              ].map((s) => (
                <div key={s.label}>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">{s.value}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ── Right: Auth Form ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="w-full max-w-sm"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 shadow-sm"
              >
                {/* Header */}
                <div className="mb-7">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {mode === 'login' && 'Sign in'}
                    {mode === 'register' && 'Create account'}
                    {mode === 'forgot' && 'Reset password'}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {mode === 'login' && 'Welcome back — continue where you left off'}
                    {mode === 'register' && 'Set up your account in seconds'}
                    {mode === 'forgot' && 'We\'ll send a reset link to your email'}
                  </p>
                </div>

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                    >
                      <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
                    </motion.div>
                  )}
                  {successMsg && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                    >
                      <p className="text-xs text-green-600 dark:text-green-400">{successMsg}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Form */}
                <form onSubmit={submitHandler} className="space-y-4">
                  {mode === 'register' && (
                    <InputField
                      label="Full Name"
                      type="text"
                      value={name}
                      onChange={setName}
                      placeholder="John Doe"
                      icon={<User className="w-4 h-4" />}
                      autoComplete="name"
                    />
                  )}

                  <InputField
                    label="Email address"
                    type="email"
                    value={email}
                    onChange={setEmail}
                    placeholder="you@example.com"
                    icon={<Mail className="w-4 h-4" />}
                    autoComplete="email"
                  />

                  {(mode === 'login' || mode === 'register') && (
                    <InputField
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={setPassword}
                      placeholder="••••••••"
                      icon={<Lock className="w-4 h-4" />}
                      autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                      rightElement={
                        <EyeToggle
                          show={showPassword}
                          onToggle={() => setShowPassword((p) => !p)}
                        />
                      }
                    />
                  )}

                  {mode === 'register' && (
                    <InputField
                      label="Confirm Password"
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={setConfirmPassword}
                      placeholder="••••••••"
                      icon={<Lock className="w-4 h-4" />}
                      autoComplete="new-password"
                      rightElement={
                        <EyeToggle
                          show={showConfirm}
                          onToggle={() => setShowConfirm((p) => !p)}
                        />
                      }
                    />
                  )}

                  {mode === 'login' && (
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => switchMode('forgot')}
                        className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                      >
                        Forgot password?
                      </button>
                    </div>
                  )}

                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-medium rounded-lg hover:bg-gray-700 dark:hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        {mode === 'login' && 'Sign in'}
                        {mode === 'register' && 'Create account'}
                        {mode === 'forgot' && 'Send reset link'}
                      </>
                    )}
                  </motion.button>
                </form>

                {/* Social */}
                {(mode === 'login' || mode === 'register') && (
                  <>
                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-100 dark:border-gray-800" />
                      </div>
                      <div className="relative flex justify-center">
                        <span className="px-3 text-xs text-gray-400 dark:text-gray-600 bg-white dark:bg-gray-900 uppercase tracking-wider">
                          Or continue with
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <SocialButton
                        onClick={() => handleOAuth('google')}
                        icon={<GoogleIcon />}
                        label="Google"
                      />
                      <SocialButton
                        onClick={() => handleOAuth('github')}
                        icon={<GitBranchPlus className="w-4 h-4" />}
                        label="GitHub"
                      />
                    </div>
                  </>
                )}

                {/* Mode switcher */}
                <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                  {mode === 'login' && (
                    <>
                      No account?{' '}
                      <button
                        onClick={() => switchMode('register')}
                        className="font-medium text-gray-900 dark:text-white hover:underline"
                      >
                        Sign up free
                      </button>
                    </>
                  )}
                  {mode === 'register' && (
                    <>
                      Already have an account?{' '}
                      <button
                        onClick={() => switchMode('login')}
                        className="font-medium text-gray-900 dark:text-white hover:underline"
                      >
                        Sign in
                      </button>
                    </>
                  )}
                  {mode === 'forgot' && (
                    <button
                      onClick={() => switchMode('login')}
                      className="font-medium text-gray-900 dark:text-white hover:underline"
                    >
                      ← Back to sign in
                    </button>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}