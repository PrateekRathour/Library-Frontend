import React, { useState } from 'react';
import {
  Search,
  Bell,
  Sparkles,
  ShieldAlert,
  UserCheck,
  ChevronDown,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const Navbar = ({ title, subtitle, onRefresh, isRefreshing }) => {
  const { user, login } = useAuth();
  const { showToast } = useToast();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [switching, setSwitching] = useState(false);

  const handleQuickSwitch = async (roleType) => {
    setSwitching(true);
    setShowRoleMenu(false);
    try {
      if (roleType === 'ADMIN') {
        await login('admin', 'admin123');
        showToast('Switched account to Admin (Dr. Robert Vance)', 'info');
      } else if (roleType === 'LIBRARIAN') {
        await login('librarian', 'librarian123');
        showToast('Switched account to Librarian (Sarah Jenkins)', 'info');
      } else {
        await login('member', 'member123');
        showToast('Switched account to Member (John Doe)', 'info');
      }
    } catch (err) {
      showToast('Could not switch demo user', 'error');
    } finally {
      setSwitching(false);
    }
  };

  return (
    <header className="h-20 bg-slate-900/60 border-b border-slate-800/80 px-8 flex items-center justify-between sticky top-0 backdrop-blur-md z-10">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
          </button>
        )}

        {/* Demo Switcher Quick Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            disabled={switching}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Switch Role (Demo)</span>
            <ChevronDown className="w-3 h-3 text-indigo-400" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-56 glass-dropdown rounded-2xl p-2 shadow-2xl z-30 animate-in fade-in zoom-in-95">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Switch Active Persona
              </div>
              <button
                onClick={() => handleQuickSwitch('ADMIN')}
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-slate-200 hover:bg-indigo-600 hover:text-white transition-colors flex items-center justify-between"
              >
                <span>👑 Admin (Full Access)</span>
                <span className="text-[10px] opacity-70">admin</span>
              </button>
              <button
                onClick={() => handleQuickSwitch('LIBRARIAN')}
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-slate-200 hover:bg-indigo-600 hover:text-white transition-colors flex items-center justify-between"
              >
                <span>📚 Librarian</span>
                <span className="text-[10px] opacity-70">librarian</span>
              </button>
              <button
                onClick={() => handleQuickSwitch('MEMBER')}
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-slate-200 hover:bg-indigo-600 hover:text-white transition-colors flex items-center justify-between"
              >
                <span>🎓 Member (Student)</span>
                <span className="text-[10px] opacity-70">member</span>
              </button>
            </div>
          )}
        </div>

        {/* Status indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>API Connected</span>
        </div>
      </div>
    </header>
  );
};
