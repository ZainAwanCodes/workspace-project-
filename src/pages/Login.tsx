import React, { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/redux/hooks';
import { login } from '@/lib/redux/slices/authSlice';
import { toggleTheme } from '@/lib/redux/slices/uiSlice';
import { useNavigate, Link } from 'react-router-dom';
import { Avatar } from '@/components/ui/Avatar';
import { ArrowLeft, ChevronRight, Sun, Moon, Layers, Zap, Users, User, Lock, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const EASE = [0.16, 1, 0.3, 1] as const;

// Feature highlights shown on the brand panel
const FEATURES = [
  { icon: Layers, label: 'Kanban, lists, and calendars', sub: 'Every view your team needs' },
  { icon: Zap, label: 'Keyboard-first workflow', sub: 'Launch anything with ⌘K' },
  { icon: Users, label: 'Real-time collaboration', sub: 'See changes as they happen' },
];

function BrandPanel() {
  const [active, setActive] = useState(0);

  // Rotate feature highlights
  useEffect(() => {
    const t = setInterval(() => setActive((n) => (n + 1) % FEATURES.length), 3200);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative flex flex-col justify-between h-full p-8 lg:p-12 overflow-hidden select-none">
      {/* Aurora background */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div
          className="absolute w-[140%] h-[140%] -top-[20%] -left-[20%] rounded-full opacity-60 animate-aurora"
          style={{
            background: 'radial-gradient(ellipse at center, var(--accent) 0%, transparent 65%)',
            filter: 'blur(60px)',
          }}
        />
        <div
          className="absolute w-[120%] h-[120%] top-[10%] left-[10%] rounded-full opacity-40 animate-aurora2"
          style={{
            background: 'radial-gradient(ellipse at center, #9D94F9 0%, transparent 60%)',
            filter: 'blur(80px)',
          }}
        />
        <div
          className="absolute w-[80%] h-[80%] bottom-[-10%] right-[-10%] rounded-full opacity-30"
          style={{
            background: 'radial-gradient(ellipse at center, var(--accent2) 0%, transparent 65%)',
            filter: 'blur(70px)',
          }}
        />
        {/* Grain */}
        <div className="absolute inset-0 landing-grain" />
      </div>

      {/* Logo */}
      <div className="relative z-10">
        <Link to="/" className="inline-flex items-center gap-2.5 group">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
            style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.22)' }}
          >
            <Layers size={18} className="text-white" />
          </div>
          <span className="font-bold text-white text-base tracking-tight">
            Workspace<span style={{ opacity: 0.7 }}>.</span>
          </span>
        </Link>
      </div>

      {/* Central headline */}
      <div className="relative z-10 flex-1 flex flex-col justify-center">
        <motion.p
          className="text-xs uppercase tracking-[0.2em] text-white/50 font-semibold mb-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          Project management
        </motion.p>
        <motion.h1
          className="text-3xl lg:text-4xl font-bold text-white leading-[1.12] tracking-[-0.02em] mb-6"
          style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.08, ease: EASE }}
        >
          Your team's work,{' '}
          <span style={{ color: 'rgba(255,255,255,0.65)' }}>beautifully organized.</span>
        </motion.h1>

        {/* Rotating feature pills */}
        <div className="h-14 relative">
          <AnimatePresence mode="wait">
            {FEATURES.map((f, i) =>
              i === active ? (
                <motion.div
                  key={i}
                  className="absolute inset-0 flex items-center gap-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35, ease: EASE }}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(255,255,255,0.14)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.18)' }}
                  >
                    <f.icon size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white leading-tight">{f.label}</p>
                    <p className="text-xs text-white/50 mt-0.5">{f.sub}</p>
                  </div>
                </motion.div>
              ) : null
            )}
          </AnimatePresence>
        </div>

        {/* Progress dots */}
        <div className="flex gap-1.5 mt-6">
          {FEATURES.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className="h-1 rounded-full transition-all duration-300"
              style={{
                width: i === active ? 20 : 6,
                background: i === active ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.25)',
              }}
              aria-label={`Feature ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Footer tagline */}
      <motion.p
        className="relative z-10 text-xs text-white/35"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Loved by 2,400+ teams worldwide
      </motion.p>
    </div>
  );
}

export default function Login() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const theme = useAppSelector((state) => state.ui.theme);
  const mockUsers = useAppSelector((state) => state.auth.users);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const activeWorkspaceId = useAppSelector((state) => state.workspaces.activeWorkspaceId);

  const [username, setUsername] = useState('alice@example.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      if (activeWorkspaceId) navigate(`/w/${activeWorkspaceId}`, { replace: true });
      else navigate('/app', { replace: true });
    }
  }, [isAuthenticated, activeWorkspaceId, navigate]);

  const handleCredentialLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedUser = username.trim();
    if (!trimmedUser) {
      setError('Please enter your username or email');
      return;
    }
    if (!password) {
      setError('Please enter your password');
      return;
    }

    setIsLoading(true);

    // Find matching user from mockUsers by email or name, or fallback to first user
    const foundUser = mockUsers.find(
      (u) =>
        u.email.toLowerCase() === trimmedUser.toLowerCase() ||
        u.name.toLowerCase() === trimmedUser.toLowerCase() ||
        u.name.toLowerCase().includes(trimmedUser.toLowerCase())
    );

    const targetUser = foundUser || mockUsers[0];

    setTimeout(() => {
      dispatch(login(targetUser.id));
      navigate('/app');
    }, 450);
  };

  const handleLogin = (userId: string) => {
    setLoadingId(userId);
    // Simulate a brief loading moment for UX
    setTimeout(() => {
      dispatch(login(userId));
      navigate('/app');
    }, 380);
  };

  return (
    <div
      className="min-h-screen flex"
      style={{ background: 'var(--bg)', color: 'var(--text-primary)' }}
    >
      {/* ── Left: Brand panel (hidden on mobile) ── */}
      <div
        className="hidden lg:flex lg:w-[45%] xl:w-[42%] relative"
        style={{ background: 'linear-gradient(135deg, #3D2FC0 0%, #5B4FE0 40%, #6D5EF5 70%, #9D50FF 100%)' }}
      >
        <BrandPanel />
      </div>

      {/* ── Right: Form panel ── */}
      <div className="flex-1 flex flex-col min-h-screen relative overflow-y-auto">
        {/* Mobile aurora banner */}
        <div
          className="lg:hidden h-2 w-full"
          style={{ background: 'linear-gradient(90deg, #3D2FC0, #6D5EF5, #9D50FF)' }}
        />

        {/* Top row: back link + theme toggle */}
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors group"
            style={{ color: 'var(--text-secondary)' }}
          >
            <ArrowLeft
              size={15}
              className="group-hover:-translate-x-0.5 transition-transform"
            />
            <span className="group-hover:text-[var(--text-primary)] transition-colors">Back</span>
          </Link>

          <button
            onClick={() => dispatch(toggleTheme())}
            className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
            style={{ background: 'var(--surface-raised)', color: 'var(--text-secondary)' }}
            aria-label="Toggle theme"
          >
            <AnimatePresence mode="wait" initial={false}>
              {theme === 'dark' ? (
                <motion.span key="sun" initial={{ rotate: -90, opacity: 0, scale: 0.7 }} animate={{ rotate: 0, opacity: 1, scale: 1 }} exit={{ rotate: 90, opacity: 0, scale: 0.7 }} transition={{ duration: 0.18 }}>
                  <Sun size={16} />
                </motion.span>
              ) : (
                <motion.span key="moon" initial={{ rotate: 90, opacity: 0, scale: 0.7 }} animate={{ rotate: 0, opacity: 1, scale: 1 }} exit={{ rotate: -90, opacity: 0, scale: 0.7 }} transition={{ duration: 0.18 }}>
                  <Moon size={16} />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>

        {/* Centered form */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-6 sm:py-8">
          <motion.div
            className="w-full max-w-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: EASE }}
          >
            {/* Brand mark — shown on mobile where panel is hidden */}
            <div className="lg:hidden flex items-center justify-center gap-2.5 mb-6">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
                style={{ background: 'var(--accent)', boxShadow: '0 4px 16px var(--accent-glow)' }}
              >
                <Layers size={18} className="text-white" />
              </div>
              <span className="font-bold text-base tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', system-ui", color: 'var(--text-primary)' }}>
                Workspace<span style={{ color: 'var(--accent)' }}>.</span>
              </span>
            </div>

            {/* Heading */}
            <div className="mb-6">
              <h2
                className="text-2xl sm:text-3xl font-bold tracking-[-0.02em] mb-1"
                style={{ fontFamily: "'Plus Jakarta Sans', system-ui", color: 'var(--text-primary)' }}
              >
                Welcome back
              </h2>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Sign in with your username and password
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 flex items-center gap-2 p-3 rounded-xl text-xs font-medium"
                style={{ background: 'var(--error-muted)', color: 'var(--error)' }}
              >
                <AlertCircle size={15} className="flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Credential Login Form */}
            <form onSubmit={handleCredentialLogin} className="space-y-4 mb-6">
              {/* Username / Email Field */}
              <div>
                <label
                  htmlFor="login-username"
                  className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Username or Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none" style={{ color: 'var(--text-muted)' }}>
                    <User size={16} />
                  </div>
                  <input
                    id="login-username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      setError(null);
                    }}
                    placeholder="e.g. alice@example.com"
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus-accent shadow-xs"
                    style={{
                      background: 'var(--surface)',
                      border: '1.5px solid var(--border)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="login-password"
                    className="block text-xs font-semibold uppercase tracking-wider"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setUsername('alice@example.com');
                      setPassword('password123');
                      setError(null);
                    }}
                    className="text-xs hover:underline transition-colors"
                    style={{ color: 'var(--accent)' }}
                  >
                    Demo password
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none" style={{ color: 'var(--text-muted)' }}>
                    <Lock size={16} />
                  </div>
                  <input
                    id="login-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError(null);
                    }}
                    placeholder="Enter your password"
                    required
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus-accent shadow-xs"
                    style={{
                      background: 'var(--surface)',
                      border: '1.5px solid var(--border)',
                      color: 'var(--text-primary)',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center transition-colors hover:opacity-80"
                    style={{ color: 'var(--text-muted)' }}
                    title={showPassword ? 'Hide password' : 'Show password'}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Options row: remember me & demo hint */}
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center space-x-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-gray-300 text-[var(--accent)] focus:ring-[var(--accent)]"
                  />
                  <span style={{ color: 'var(--text-secondary)' }}>Remember me</span>
                </label>
                <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                  Default: password123
                </span>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                id="login-submit-btn"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl text-white font-semibold text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                style={{
                  background: 'var(--accent)',
                  boxShadow: '0 4px 16px var(--accent-glow)',
                }}
                whileHover={{ scale: 1.01, boxShadow: '0 6px 20px var(--accent-glow)' }}
                whileTap={{ scale: 0.99 }}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </motion.button>
            </form>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-6">
              <div className="border-t w-full" style={{ borderColor: 'var(--border)' }} />
              <span
                className="px-3 text-[11px] font-semibold uppercase tracking-wider relative"
                style={{ background: 'var(--bg)', color: 'var(--text-muted)' }}
              >
                Or select demo account
              </span>
            </div>

            {/* Account quick switcher list */}
            <div className="space-y-2">
              {mockUsers.map((user, i) => (
                <motion.button
                  key={user.id}
                  type="button"
                  id={`login-user-${user.id}`}
                  onClick={() => {
                    setUsername(user.email);
                    setPassword('password123');
                    handleLogin(user.id);
                  }}
                  disabled={loadingId !== null || isLoading}
                  className="w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all group relative overflow-hidden"
                  style={{
                    background: 'var(--surface)',
                    border: '1.5px solid var(--border)',
                  }}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35, delay: i * 0.05, ease: EASE }}
                  whileHover={{
                    borderColor: 'var(--accent)',
                    boxShadow: '0 0 0 3px var(--accent-glow-soft)',
                    y: -1,
                  }}
                  whileTap={{ scale: 0.99 }}
                >
                  <Avatar name={user.name} src={user.avatar} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                      {user.name}
                    </p>
                    <p className="text-[11px] truncate" style={{ color: 'var(--text-muted)' }}>
                      {user.email}
                    </p>
                  </div>

                  <AnimatePresence mode="wait">
                    {loadingId === user.id ? (
                      <motion.div
                        key="spinner"
                        initial={{ opacity: 0, scale: 0.6 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.6 }}
                        transition={{ duration: 0.15 }}
                      >
                        <svg
                          className="w-3.5 h-3.5 animate-spin"
                          style={{ color: 'var(--accent)' }}
                          fill="none" viewBox="0 0 24 24"
                        >
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      </motion.div>
                    ) : (
                      <span
                        className="text-[10px] font-medium px-2 py-0.5 rounded-md transition-all group-hover:bg-[var(--accent-muted)] group-hover:text-[var(--accent)]"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        Quick Login →
                      </span>
                    )}
                  </AnimatePresence>
                </motion.button>
              ))}
            </div>

            {/* Footer note */}
            <p className="text-xs text-center mt-6" style={{ color: 'var(--text-muted)' }}>
              Enter any credentials or click a demo account above
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
