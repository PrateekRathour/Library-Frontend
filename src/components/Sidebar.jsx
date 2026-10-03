import React from 'react';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Repeat,
  DollarSign,
  BookmarkCheck,
  LogOut,
  Sparkles,
  ShieldCheck,
  BookMarked
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { RoleBadge } from './Badge';

export const Sidebar = ({ activeTab, setActiveTab, unreturnedOverdueCount = 0, pendingFinesCount = 0 }) => {
  const { user, logout, isMember, canManageBooks, canManageMembers, canManageCirculation } = useAuth();

  const navItems = [
    ...(canManageBooks
      ? [
          {
            id: 'dashboard',
            label: 'Overview & Stats',
            icon: LayoutDashboard,
          },
        ]
      : []),
    {
      id: 'books',
      label: 'Book Catalog',
      icon: BookOpen,
    },
    ...(canManageMembers
      ? [
          {
            id: 'members',
            label: 'Member Directory',
            icon: Users,
          },
        ]
      : []),
    ...(canManageCirculation
      ? [
          {
            id: 'circulation',
            label: 'Issue & Return',
            icon: Repeat,
            badge: unreturnedOverdueCount > 0 ? unreturnedOverdueCount : null,
            badgeColor: 'bg-rose-500 text-white',
          },
        ]
      : []),
    {
      id: 'fines',
      label: isMember ? 'My Fines' : 'Fine Management',
      icon: DollarSign,
      badge: pendingFinesCount > 0 ? pendingFinesCount : null,
      badgeColor: 'bg-amber-500 text-slate-950 font-bold',
    },
    ...(isMember
      ? [
          {
            id: 'my-borrows',
            label: 'My Borrowed Books',
            icon: BookmarkCheck,
          },
        ]
      : []),
  ];

  return (
    <aside className="w-64 bg-slate-900/95 border-r border-slate-800/80 flex flex-col justify-between shrink-0 h-screen sticky top-0 backdrop-blur-xl z-20">
      {/* Brand Header */}
      <div>
        <div className="p-6 border-b border-slate-800/60 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <BookMarked className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-wide flex items-center gap-1.5">
              Athena <span className="text-xs bg-indigo-500/20 text-indigo-400 font-semibold px-2 py-0.5 rounded border border-indigo-500/30">PRO</span>
            </h1>
            <p className="text-xs text-slate-400 font-medium">Library Intelligence</p>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="p-4 space-y-1.5">
          <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Main Menu
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      item.badgeColor || 'bg-slate-700 text-slate-200'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* User Profile & Logout Bottom Section */}
      <div className="p-4 border-t border-slate-800/60">
        <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center font-bold text-white text-sm shrink-0">
              {user?.fullName ? user.fullName.charAt(0) : 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.fullName}</p>
              <p className="text-xs text-slate-400 truncate">@{user?.username}</p>
            </div>
          </div>
          <div className="pt-1 flex items-center justify-between">
            <RoleBadge role={user?.role} />
            <button
              onClick={logout}
              title="Sign Out"
              className="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
