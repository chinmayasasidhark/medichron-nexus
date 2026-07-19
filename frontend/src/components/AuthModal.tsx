import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, Activity, AlertCircle, ArrowRight, ShieldCheck, X } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { login, signup, loginWithGoogle, isSandbox } = useAuth();
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [displayName, setDisplayName] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all credentials.');
      return;
    }
    if (isSignUp && !displayName) {
      setError('Please enter a display name.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        await signup(email, password, displayName);
      } else {
        await login(email, password);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists.');
      } else {
        setError(err.message || 'An error occurred during authentication.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle();
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to authenticate with Google.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/65 backdrop-blur-md cursor-pointer"
        />

        {/* Modal body */}
        <motion.div
          initial={{ opacity: 0, scale: 0.93, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: 15 }}
          transition={{ type: 'spring', damping: 20, stiffness: 260 }}
          className="relative w-full max-w-md overflow-hidden rounded-3xl bg-slate-900/90 p-8 border border-slate-700/50 shadow-2xl backdrop-blur-xl z-10"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
          {/* Subtle colored glow effects */}
          <div className="absolute -top-12 -left-12 w-32 h-32 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Sandbox Indicator */}
          {isSandbox && (
            <div className="mb-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              Developer Bypass (Sandbox Auth)
            </div>
          )}

          {/* Brand Header */}
          <div className="flex flex-col items-center mb-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-secondary to-brand-accent flex items-center justify-center shadow-lg shadow-teal-500/10 mb-3">
              <Activity className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              {isSignUp ? 'Create your profile' : 'Welcome to MediChron'}
            </h2>
            <p className="text-slate-400 text-xs mt-1">
              {isSignUp ? 'Track and build your clinical history timeline' : 'Sign in to access your intelligence reports'}
            </p>
          </div>

          {/* Error Message */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                className="mb-4 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-start gap-2.5 text-rose-300 text-xs leading-relaxed"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider pl-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full bg-slate-800/40 border border-slate-700/60 focus:border-teal-400 focus:ring-2 focus:ring-teal-500/20 text-white rounded-xl py-3 pl-11 pr-4 text-sm outline-none transition-all"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider pl-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-800/40 border border-slate-700/60 focus:border-teal-400 focus:ring-2 focus:ring-teal-500/20 text-white rounded-xl py-3 pl-11 pr-4 text-sm outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider pl-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-800/40 border border-slate-700/60 focus:border-teal-400 focus:ring-2 focus:ring-teal-500/20 text-white rounded-xl py-3 pl-11 pr-4 text-sm outline-none transition-all"
                />
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full py-3 bg-gradient-to-r from-brand-secondary to-brand-accent text-white font-semibold text-sm rounded-xl cursor-pointer hover:opacity-90 flex items-center justify-center gap-2 shadow-lg shadow-teal-500/10 mt-6 relative"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isSignUp ? 'Create Account' : 'Sign In'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>

          {/* Social Divider */}
          <div className="relative my-6 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <span className="relative bg-slate-900 px-3 text-[10px] uppercase font-bold text-slate-500 tracking-widest">Or continue with</span>
          </div>

          {/* Google Sign In */}
          <motion.button
            onClick={handleGoogleSignIn}
            disabled={loading}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="button"
            className="w-full py-3 bg-slate-800/50 hover:bg-slate-800/80 border border-slate-700/60 text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2.5 cursor-pointer transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Sign in with Google
          </motion.button>

          {/* Switch Tab Trigger */}
          <div className="text-center mt-6">
            <button
              onClick={() => {
                setError('');
                setIsSignUp(!isSignUp);
              }}
              className="text-xs text-teal-400 hover:text-teal-300 font-semibold cursor-pointer underline underline-offset-4"
            >
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AuthModal;
