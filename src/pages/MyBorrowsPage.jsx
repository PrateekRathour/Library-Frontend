import React, { useState, useEffect } from 'react';
import {
  BookmarkCheck,
  RotateCcw,
  Clock,
  BookOpen,
  Calendar,
  AlertTriangle,
  Layers,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import api from '../api/axios';
import { StatusBadge } from '../components/Badge';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const MyBorrowsPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyLoans = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/borrow/member/${user.id}`);
      if (res.data && res.data.data) {
        setLoans(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching member loans:', err);
      showToast('Could not load your borrow history', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchMyLoans();
    }
  }, [user?.id]);

  const handleRenew = async (recordId) => {
    try {
      await api.post(`/borrow/renew/${recordId}`);
      showToast('Book renewed for 14 additional days!', 'success');
      fetchMyLoans();
    } catch (err) {
      showToast(err.response?.data?.message || 'Cannot renew book', 'error');
    }
  };

  const activeLoans = loans.filter((l) => l.status === 'ISSUED');
  const pastLoans = loans.filter((l) => l.status === 'RETURNED');

  const getDaysDiff = (dueDateStr) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDateStr);
    due.setHours(0, 0, 0, 0);
    const diffTime = due - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-950/60 to-slate-900 border border-indigo-500/20 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <BookmarkCheck className="w-5 h-5 text-indigo-400" />
            <span>My Borrowed Books & Reading Activity</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Keep track of your due dates, renew active loans, and view your library reading history.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3.5 py-1.5 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold">
            {activeLoans.length} Active Loans
          </span>
          <span className="px-3.5 py-1.5 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold">
            {pastLoans.length} Returned
          </span>
        </div>
      </div>

      {/* Currently Borrowed Section */}
      <div className="space-y-4">
        <h4 className="text-base font-bold text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-400" />
          <span>Currently Checked Out ({activeLoans.length})</span>
        </h4>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : activeLoans.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 text-center">
            <BookOpen className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-white">No active book loans</p>
            <p className="text-xs text-slate-400 mt-1">Visit the Book Catalog to find your next great read!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeLoans.map((loan) => {
              const daysLeft = getDaysDiff(loan.dueDate);
              const isOverdue = daysLeft < 0;

              return (
                <div
                  key={loan.id}
                  className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 transition-all flex flex-col justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={loan.book?.coverImageUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80'}
                      alt=""
                      className="w-16 h-24 object-cover rounded-xl bg-slate-950 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-[11px] font-semibold text-indigo-400">{loan.book?.genre}</span>
                      <h5 className="text-base font-bold text-white truncate mt-0.5">{loan.book?.title}</h5>
                      <p className="text-xs text-slate-400">Author: {loan.book?.author}</p>
                      
                      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                        <span className="text-slate-400">Issued: {loan.issueDate}</span>
                        <span className="text-slate-600">•</span>
                        <span className="text-slate-300 font-medium">Due: {loan.dueDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <div>
                      {isOverdue ? (
                        <span className="text-xs font-bold text-rose-400 bg-rose-500/15 border border-rose-500/30 px-2.5 py-1 rounded-lg">
                          ⚠️ Overdue by {Math.abs(daysLeft)} days
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 rounded-lg">
                          ✓ {daysLeft} days remaining
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleRenew(loan.id)}
                      disabled={isOverdue}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all ${
                        !isOverdue
                          ? 'bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border-indigo-500/30'
                          : 'bg-slate-800 text-slate-600 border-slate-800 cursor-not-allowed'
                      }`}
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Renew Loan (+14d)</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Past Reading History */}
      <div className="space-y-4">
        <h4 className="text-base font-bold text-white flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-emerald-400" />
          <span>Reading History & Returned Books ({pastLoans.length})</span>
        </h4>

        {pastLoans.length === 0 ? (
          <p className="text-xs text-slate-500 p-6 rounded-2xl bg-slate-900/30 border border-slate-800 text-center">
            No past borrowing history yet.
          </p>
        ) : (
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-slate-400 bg-slate-800/40 border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3 font-semibold">Book Title</th>
                  <th className="px-4 py-3 font-semibold">Genre</th>
                  <th className="px-4 py-3 font-semibold">Borrowed On</th>
                  <th className="px-4 py-3 font-semibold">Returned On</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {pastLoans.map((loan) => (
                  <tr key={loan.id} className="hover:bg-slate-800/30">
                    <td className="px-5 py-3 font-semibold text-white">{loan.book?.title}</td>
                    <td className="px-4 py-3 text-slate-400">{loan.book?.genre}</td>
                    <td className="px-4 py-3 text-slate-400">{loan.issueDate}</td>
                    <td className="px-4 py-3 text-emerald-400 font-medium">{loan.returnDate}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={loan.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
