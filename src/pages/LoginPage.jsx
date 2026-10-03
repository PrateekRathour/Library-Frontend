import React, { useState } from 'react';
import {
  BookMarked,
  Sparkles,
  Lock,
  User,
  ArrowRight,
  ShieldCheck,
  BookOpen,
  Users
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const LoginPage = ({ onSwitchToRegister }) => {
  const { login } = useAuth();
  const { showToast } = useToast();

  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(usernameOrEmail, password);
      showToast('Logged in successfully!', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Invalid credentials', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (userType) => {
    setLoading(true);
    let u = 'admin';
    let p = 'admin123';
    let label = 'Administrator';

    if (userType === 'LIBRARIAN') {
      u = 'librarian';
      p = 'librarian123';
      label = 'Librarian';
    } else if (userType === 'MEMBER') {
      u = 'member';
      p = 'member123';
      label = 'Member';
    }

    setUsernameOrEmail(u);
    setPassword(p);

    try {
      await login(u, p);
      showToast(`Logged in as ${label}`, 'success');
    } catch (err) {
      showToast('Quick login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-slate-950 relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-5xl rounded-3xl glass-panel shadow-2xl border border-slate-800 grid grid-cols-1 lg:grid-cols-2 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-300">
        {/* Left Side: Showcase */}
        <div className="p-8 sm:p-12 bg-gradient-to-br from-indigo-950/80 via-slate-900 to-purple-950/80 border-b lg:border-b-0 lg:border-r border-slate-800/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <BookMarked className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
                  Athena <span className="text-xs bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded font-semibold border border-indigo-500/30">LMS</span>
                </h1>
                <p className="text-xs text-slate-400">Library Management & Automation System</p>
              </div>
            </div>

            <div className="mt-10 space-y-6">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                Empower your library with automated circulation & analytics.
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                A full-stack enterprise platform powered by Spring Boot, Spring Security, JWT, JPA/Hibernate, MySQL, and modern React.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 text-xs text-slate-200">
                  <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <span>Instant Book Issue, Return, & Stock Availability tracking</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-200">
                  <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span>Automated Overdue Calculation & Integrated Fine Checkout</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-200">
                  <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                    <Users className="w-4 h-4" />
                  </div>
                  <span>Multi-role RBAC for Admins, Staff Librarians, and Members</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Demo Login Bar */}
          <div className="mt-8 pt-6 border-t border-slate-800/80">
            <p className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>1-Click Demo Accounts</span>
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('ADMIN')}
                className="px-2.5 py-2 rounded-xl bg-slate-800/80 hover:bg-indigo-600/30 text-white text-xs font-semibold border border-slate-700/80 hover:border-indigo-500/50 transition-all text-center"
              >
                👑 Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('LIBRARIAN')}
                className="px-2.5 py-2 rounded-xl bg-slate-800/80 hover:bg-indigo-600/30 text-white text-xs font-semibold border border-slate-700/80 hover:border-indigo-500/50 transition-all text-center"
              >
                📚 Librarian
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('MEMBER')}
                className="px-2.5 py-2 rounded-xl bg-slate-800/80 hover:bg-indigo-600/30 text-white text-xs font-semibold border border-slate-700/80 hover:border-indigo-500/50 transition-all text-center"
              >
                🎓 Member
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Sign In Form */}
        <div className="p-8 sm:p-12 flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto space-y-6">
            <div>
              <h3 className="text-2xl font-extrabold text-white tracking-tight">Sign In</h3>
              <p className="text-xs text-slate-400 mt-1">
                Enter your credentials to access your library portal.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Username or Email
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={usernameOrEmail}
                    onChange={(e) => setUsernameOrEmail(e.target.value)}
                    placeholder="e.g. admin or john@example.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Authenticate & Enter</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="text-center pt-2">
              <p className="text-xs text-slate-400">
                Don't have a student/member account?{' '}
                <button
                  type="button"
                  onClick={onSwitchToRegister}
                  className="font-bold text-indigo-400 hover:text-indigo-300 underline"
                >
                  Register here
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
