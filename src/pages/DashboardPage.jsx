import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Users,
  Repeat,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  PlusCircle,
  ArrowRight,
  Sparkles,
  Calendar,
  CheckCircle2,
  Clock
} from 'lucide-react';
import api from '../api/axios';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/Badge';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const DashboardPage = ({ setActiveTab, openIssueModal, openAddBookModal }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/stats');
      if (res.data && res.data.data) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      showToast('Could not load dashboard statistics', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm font-medium">Loading library analytics...</p>
        </div>
      </div>
    );
  }

  const genreEntries = stats?.genreDistribution ? Object.entries(stats.genreDistribution) : [];
  const maxGenreCount = genreEntries.length > 0 ? Math.max(...genreEntries.map(([_, count]) => count)) : 1;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 border border-indigo-500/20 p-8 shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Library Management Hub</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Welcome back, {user?.fullName || 'Librarian'}
          </h1>
          <p className="mt-2 text-slate-300 text-sm leading-relaxed">
            Monitor real-time book circulation, track overdue loans, manage member fines, and explore library collection analytics from a centralized dashboard.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('circulation')}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
            >
              <Repeat className="w-4 h-4" />
              <span>Issue / Return Books</span>
            </button>
            <button
              onClick={() => setActiveTab('books')}
              className="px-5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-semibold text-sm transition-all flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>Explore Catalog</span>
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 top-0 -mr-16 -mt-16 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-32 bottom-0 -mb-16 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Book Titles"
          value={stats?.totalBooks || 0}
          icon={BookOpen}
          color="indigo"
          subtitle="Unique titles in collection"
        />
        <StatCard
          title="Active Loans"
          value={stats?.activeLoans || 0}
          icon={Repeat}
          color="emerald"
          subtitle="Books currently in circulation"
        />
        <StatCard
          title="Overdue Books"
          value={stats?.overdueLoans || 0}
          icon={AlertTriangle}
          color="rose"
          subtitle="Requires immediate return notice"
          trend={stats?.overdueLoans > 0 ? `${stats.overdueLoans} Alert` : null}
        />
        <StatCard
          title="Pending Fines"
          value={`₹${(stats?.totalFinesPending || 0).toFixed(2)}`}
          icon={DollarSign}
          color="amber"
          subtitle={`₹${(stats?.totalFinesCollected || 0).toFixed(2)} collected so far`}
        />
      </div>

      {/* Analytics & Distribution Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Genre Breakdown */}
        <div className="lg:col-span-1 p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <span>Genre Distribution</span>
            </h3>
            <span className="text-xs text-slate-400 font-medium">Categories</span>
          </div>

          <div className="mt-5 space-y-4">
            {genreEntries.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No categories registered yet</p>
            ) : (
              genreEntries.map(([genre, count]) => {
                const percent = Math.round((count / (stats?.totalBooks || 1)) * 100);
                return (
                  <div key={genre} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-300">{genre}</span>
                      <span className="text-slate-400 font-medium">{count} books ({percent}%)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                        style={{ width: `${Math.max(12, (count / maxGenreCount) * 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Borrowing Activity Trends */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Circulation Trends (Last 6 Months)</span>
            </h3>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-indigo-400">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Borrows
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Returns
              </span>
            </div>
          </div>

          {/* Bar / Trends visualization */}
          <div className="mt-6 grid grid-cols-6 gap-3 items-end h-48 pt-4">
            {stats?.monthlyTrends?.map((item, idx) => {
              const maxVal = 40;
              const borrowHeight = Math.min(100, Math.round((item.borrows / maxVal) * 100));
              const returnHeight = Math.min(100, Math.round((item.returns / maxVal) * 100));

              return (
                <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end">
                  <div className="w-full flex items-end justify-center gap-1.5 h-36">
                    <div
                      title={`Borrows: ${item.borrows}`}
                      className="w-4 rounded-t-lg bg-indigo-500 hover:bg-indigo-400 transition-all"
                      style={{ height: `${borrowHeight}%` }}
                    />
                    <div
                      title={`Returns: ${item.returns}`}
                      className="w-4 rounded-t-lg bg-emerald-500 hover:bg-emerald-400 transition-all"
                      style={{ height: `${returnHeight}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400">{item.month.split(' ')[0]}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Circulation Activities Table */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              <span>Recent Circulation Transactions</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Latest book issues, returns, and renewals</p>
          </div>
          <button
            onClick={() => setActiveTab('circulation')}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            <span>View All Records</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-400 bg-slate-800/40 border-b border-slate-800">
              <tr>
                <th className="px-4 py-3 font-semibold">Book Title</th>
                <th className="px-4 py-3 font-semibold">Member</th>
                <th className="px-4 py-3 font-semibold">Issue Date</th>
                <th className="px-4 py-3 font-semibold">Due Date</th>
                <th className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {stats?.recentBorrows?.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-6 text-center text-slate-500 text-xs">
                    No transactions recorded yet.
                  </td>
                </tr>
              ) : (
                stats?.recentBorrows?.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 font-semibold text-white truncate max-w-xs">
                      {item.bookTitle}
                    </td>
                    <td className="px-4 py-3 text-slate-300 font-medium">
                      {item.memberName} <span className="text-xs text-slate-500">(@{item.memberUsername})</span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{item.issueDate}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{item.dueDate}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={item.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
