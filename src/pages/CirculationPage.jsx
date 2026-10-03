import React, { useState, useEffect } from 'react';
import {
  Repeat,
  BookmarkPlus,
  RotateCcw,
  Clock,
  AlertTriangle,
  Search,
  CheckCircle2,
  Calendar,
  Layers,
  User,
  BookOpen,
  ArrowRight,
  DollarSign
} from 'lucide-react';
import api from '../api/axios';
import { StatusBadge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const CirculationPage = () => {
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();

  const [activeSubTab, setActiveSubTab] = useState('active'); // 'issue' | 'active' | 'overdue' | 'history'
  const [loading, setLoading] = useState(false);

  // Data lists
  const [activeLoans, setActiveLoans] = useState([]);
  const [overdueLoans, setOverdueLoans] = useState([]);
  const [allHistory, setAllHistory] = useState([]);
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Issue Form state
  const [issueBookId, setIssueBookId] = useState('');
  const [issueMemberId, setIssueMemberId] = useState('');
  const [issueDays, setIssueDays] = useState(14);
  const [issueRemarks, setIssueRemarks] = useState('');

  // Return Modal state
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [returnRemarks, setReturnRemarks] = useState('');

  const fetchCirculationData = async () => {
    try {
      setLoading(true);
      const [activeRes, overdueRes, historyRes, booksRes, membersRes] = await Promise.all([
        api.get('/borrow/active'),
        api.get('/borrow/overdue'),
        api.get('/borrow/history', { params: { query: searchQuery } }),
        api.get('/books'),
        api.get('/members'),
      ]);

      setActiveLoans(activeRes.data.data || []);
      setOverdueLoans(overdueRes.data.data || []);
      setAllHistory(historyRes.data.data || []);
      setBooks(booksRes.data.data || []);
      setMembers(membersRes.data.data || []);
    } catch (err) {
      console.error('Error loading circulation data:', err);
      showToast('Could not load circulation records', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCirculationData();
  }, [searchQuery]);

  const handleIssueSubmit = async (e) => {
    e.preventDefault();
    if (!issueBookId || !issueMemberId) {
      showToast('Please select both a book and a member', 'error');
      return;
    }

    try {
      await api.post('/borrow/issue', {
        bookId: parseInt(issueBookId),
        memberId: parseInt(issueMemberId),
        days: parseInt(issueDays),
        remarks: issueRemarks,
      });

      showToast('Book issued successfully!', 'success');
      setIssueBookId('');
      setIssueMemberId('');
      setIssueRemarks('');
      setActiveSubTab('active');
      fetchCirculationData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to issue book', 'error');
    }
  };

  const handleOpenReturnModal = (record) => {
    setSelectedRecord(record);
    setReturnRemarks('');
    setIsReturnModalOpen(true);
  };

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(`/borrow/return/${selectedRecord.id}`, {
        remarks: returnRemarks,
      });
      showToast(`Book "${selectedRecord.book.title}" returned!`, 'success');
      setIsReturnModalOpen(false);
      fetchCirculationData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to return book', 'error');
    }
  };

  const handleRenewLoan = async (recordId) => {
    try {
      await api.post(`/borrow/renew/${recordId}`);
      showToast('Loan renewed for 14 additional days!', 'success');
      fetchCirculationData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to renew book', 'error');
    }
  };

  // Helper to calculate days remaining or overdue
  const getDaysDiff = (dueDateStr) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDateStr);
    due.setHours(0, 0, 0, 0);
    const diffTime = due - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const selectedBookForIssue = books.find((b) => b.id === parseInt(issueBookId));
  const selectedMemberForIssue = members.find((m) => m.id === parseInt(issueMemberId));

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-2 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveSubTab('active')}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              activeSubTab === 'active'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Active Borrowed Books ({activeLoans.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('overdue')}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              activeSubTab === 'overdue'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Overdue Tracker ({overdueLoans.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('issue')}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              activeSubTab === 'issue'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <BookmarkPlus className="w-4 h-4" />
            <span>Issue New Book</span>
          </button>

          <button
            onClick={() => setActiveSubTab('history')}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              activeSubTab === 'history'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Repeat className="w-4 h-4" />
            <span>Full Circulation Log</span>
          </button>
        </div>

        {activeSubTab !== 'issue' && (
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search loans..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl glass-input text-xs"
            />
          </div>
        )}
      </div>

      {/* Tab 1: Issue Book Form */}
      {activeSubTab === 'issue' && (
        <div className="p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl max-w-3xl mx-auto">
          <div className="pb-6 border-b border-slate-800 mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <BookmarkPlus className="w-5 h-5 text-indigo-400" />
              <span>Issue Book to Member</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Select an available book title and a registered member to create a new circulation record.
            </p>
          </div>

          <form onSubmit={handleIssueSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Select Book */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  1. Select Book Title *
                </label>
                <select
                  required
                  value={issueBookId}
                  onChange={(e) => setIssueBookId(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-xl glass-input text-sm text-slate-200"
                >
                  <option value="" disabled>Choose an available book...</option>
                  {books.map((b) => (
                    <option key={b.id} value={b.id} disabled={b.availableCopies <= 0}>
                      {b.title} ({b.availableCopies} in stock) - {b.genre}
                    </option>
                  ))}
                </select>

                {selectedBookForIssue && (
                  <div className="mt-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 flex items-center gap-3 text-xs">
                    <img
                      src={selectedBookForIssue.coverImageUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80'}
                      alt=""
                      className="w-8 h-12 object-cover rounded bg-slate-950 shrink-0"
                    />
                    <div>
                      <p className="font-bold text-white">{selectedBookForIssue.title}</p>
                      <p className="text-slate-400">by {selectedBookForIssue.author} • Shelf: {selectedBookForIssue.shelfLocation}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Select Member */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  2. Select Member *
                </label>
                <select
                  required
                  value={issueMemberId}
                  onChange={(e) => setIssueMemberId(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-xl glass-input text-sm text-slate-200"
                >
                  <option value="" disabled>Choose member / student...</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id} disabled={m.status !== 'ACTIVE'}>
                      {m.fullName} (@{m.username}) - {m.activeBorrowsCount} active loans
                    </option>
                  ))}
                </select>

                {selectedMemberForIssue && (
                  <div className="mt-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-white">{selectedMemberForIssue.fullName}</p>
                      <p className="text-slate-400">{selectedMemberForIssue.email}</p>
                    </div>
                    <span className="text-indigo-400 font-semibold">{selectedMemberForIssue.activeBorrowsCount} active loans</span>
                  </div>
                )}
              </div>
            </div>

            {/* Loan Duration Preset */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                3. Loan Duration & Expected Return Date
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[7, 14, 21, 30].map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => setIssueDays(days)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      issueDays === days
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                        : 'bg-slate-800/50 border-slate-700/50 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    {days} Days ({days / 7 === 1 ? '1 Week' : `${days / 7} Weeks`})
                  </button>
                ))}
              </div>

              <div className="mt-3 p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/20 text-xs text-indigo-300 flex items-center justify-between">
                <span>Calculated Due Date:</span>
                <span className="font-bold text-white">
                  {new Date(Date.now() + issueDays * 86400000).toLocaleDateString(undefined, {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </div>

            {/* Remarks */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                4. Remarks / Circulation Notes
              </label>
              <input
                type="text"
                value={issueRemarks}
                onChange={(e) => setIssueRemarks(e.target.value)}
                placeholder="e.g. Regular course lending, fine waiver coupon, special permission..."
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm"
              />
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all flex items-center gap-2"
              >
                <BookmarkPlus className="w-4 h-4" />
                <span>Issue Book Now</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: Active Borrowed Books */}
      {activeSubTab === 'active' && (
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 bg-slate-900/40 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-white text-sm">Active Book Loans</h4>
              <p className="text-xs text-slate-400">Books currently in members' possession</p>
            </div>
            <span className="text-xs text-slate-400 font-medium">{activeLoans.length} active records</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-slate-400 bg-slate-800/40 border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">Book</th>
                  <th className="px-4 py-3.5 font-semibold">Borrower</th>
                  <th className="px-4 py-3.5 font-semibold">Issue Date</th>
                  <th className="px-4 py-3.5 font-semibold">Due Date</th>
                  <th className="px-4 py-3.5 font-semibold">Time Remaining</th>
                  <th className="px-5 py-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {activeLoans.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center text-slate-500 text-xs">
                      No books currently borrowed.
                    </td>
                  </tr>
                ) : (
                  activeLoans.map((loan) => {
                    const daysLeft = getDaysDiff(loan.dueDate);
                    const isOverdue = daysLeft < 0;

                    return (
                      <tr key={loan.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-5 py-3.5">
                          <p className="font-bold text-white text-sm">{loan.book?.title}</p>
                          <p className="text-xs text-slate-400 font-mono">ISBN: {loan.book?.isbn}</p>
                        </td>
                        <td className="px-4 py-3.5">
                          <p className="font-medium text-slate-200 text-sm">{loan.member?.fullName}</p>
                          <p className="text-xs text-slate-400">@{loan.member?.username}</p>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-slate-400">{loan.issueDate}</td>
                        <td className="px-4 py-3.5 text-xs text-slate-300 font-medium">{loan.dueDate}</td>
                        <td className="px-4 py-3.5">
                          {isOverdue ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                              Overdue by {Math.abs(daysLeft)} days
                            </span>
                          ) : daysLeft === 0 ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                              Due Today
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                              {daysLeft} days remaining
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleRenewLoan(loan.id)}
                              disabled={isOverdue}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                                !isOverdue
                                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                                  : 'text-slate-600 border-slate-800 cursor-not-allowed'
                              }`}
                              title="Renew (+14 days)"
                            >
                              <RotateCcw className="w-3.5 h-3.5 inline mr-1" />
                              Renew
                            </button>
                            <button
                              onClick={() => handleOpenReturnModal(loan)}
                              className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-1.5"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Return</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Overdue Tracker */}
      {activeSubTab === 'overdue' && (
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 bg-rose-950/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Overdue Loans Requiring Action</h4>
                <p className="text-xs text-rose-300">Late returns will automatically accrue a ₹10.00/day fine on return.</p>
              </div>
            </div>
            <span className="text-xs font-bold text-rose-400 bg-rose-500/20 px-3 py-1 rounded-full border border-rose-500/30">
              {overdueLoans.length} Overdue
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-slate-400 bg-slate-800/40 border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">Book Title</th>
                  <th className="px-4 py-3.5 font-semibold">Member</th>
                  <th className="px-4 py-3.5 font-semibold">Due Date</th>
                  <th className="px-4 py-3.5 font-semibold">Days Overdue</th>
                  <th className="px-4 py-3.5 font-semibold">Accrued Fine</th>
                  <th className="px-5 py-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {overdueLoans.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center text-emerald-400 text-xs font-semibold">
                      🎉 Excellent! There are no overdue books at this time.
                    </td>
                  </tr>
                ) : (
                  overdueLoans.map((loan) => {
                    const daysOver = Math.abs(getDaysDiff(loan.dueDate));
                    const estFine = (daysOver * 10.0).toFixed(2);

                    return (
                      <tr key={loan.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-5 py-3.5">
                          <p className="font-bold text-white text-sm">{loan.book?.title}</p>
                          <p className="text-xs text-slate-400 font-mono">ISBN: {loan.book?.isbn}</p>
                        </td>
                        <td className="px-4 py-3.5">
                          <p className="font-medium text-slate-200 text-sm">{loan.member?.fullName}</p>
                          <p className="text-xs text-slate-400">@{loan.member?.username} • {loan.member?.phone || 'No phone'}</p>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-rose-400 font-semibold">{loan.dueDate}</td>
                        <td className="px-4 py-3.5">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                            {daysOver} Days Late
                          </span>
                        </td>
                        <td className="px-4 py-3.5 font-bold text-amber-400 text-sm">
                          ₹{estFine}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <button
                            onClick={() => handleOpenReturnModal(loan)}
                            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 transition-all flex items-center gap-1.5 ml-auto"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Process Return & Fine</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Circulation History */}
      {activeSubTab === 'history' && (
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 bg-slate-900/40">
            <h4 className="font-bold text-white text-sm">Historical Circulation Log</h4>
            <p className="text-xs text-slate-400">Complete chronological ledger of all loan transactions</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-slate-400 bg-slate-800/40 border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">Book Title</th>
                  <th className="px-4 py-3.5 font-semibold">Borrower</th>
                  <th className="px-4 py-3.5 font-semibold">Issue Date</th>
                  <th className="px-4 py-3.5 font-semibold">Due Date</th>
                  <th className="px-4 py-3.5 font-semibold">Return Date</th>
                  <th className="px-4 py-3.5 font-semibold">Issuer</th>
                  <th className="px-4 py-3.5 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {allHistory.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-3.5 font-semibold text-white truncate max-w-xs">
                      {rec.book?.title}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-300 font-medium">
                      {rec.member?.fullName} (@{rec.member?.username})
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-400">{rec.issueDate}</td>
                    <td className="px-4 py-3.5 text-xs text-slate-400">{rec.dueDate}</td>
                    <td className="px-4 py-3.5 text-xs text-slate-300 font-semibold">
                      {rec.returnDate || '—'}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-400">@{rec.issuedBy || 'system'}</td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={rec.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Process Return Book Modal */}
      <Modal
        isOpen={isReturnModalOpen}
        onClose={() => setIsReturnModalOpen(false)}
        title="Process Book Return"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleReturnSubmit} className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-2">
            <h5 className="font-bold text-white text-sm">{selectedRecord?.book?.title}</h5>
            <p className="text-xs text-slate-400">Borrower: {selectedRecord?.member?.fullName}</p>
            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-700">
              <span className="text-slate-400">Due Date: {selectedRecord?.dueDate}</span>
              {selectedRecord && getDaysDiff(selectedRecord.dueDate) < 0 && (
                <span className="font-bold text-rose-400">
                  Late Fine: ₹{(Math.abs(getDaysDiff(selectedRecord.dueDate)) * 10.0).toFixed(2)}
                </span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Return Remarks / Condition</label>
            <input
              type="text"
              value={returnRemarks}
              onChange={(e) => setReturnRemarks(e.target.value)}
              placeholder="e.g. Good condition, normal wear..."
              className="w-full px-3.5 py-2 rounded-xl glass-input text-sm"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsReturnModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all"
            >
              Confirm Return
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
