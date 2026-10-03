import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Search,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  QrCode,
  Banknote,
  Receipt,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import api from '../api/axios';
import { StatusBadge } from '../components/Badge';
import { StatCard } from '../components/StatCard';
import { Modal } from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const FinesPage = () => {
  const { user, isAdmin, isMember } = useAuth();
  const { showToast } = useToast();

  const [fines, setFines] = useState([]);
  const [stats, setStats] = useState({ totalPendingFines: 0, totalCollectedFines: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Modals
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isWaiveModalOpen, setIsWaiveModalOpen] = useState(false);
  const [selectedFine, setSelectedFine] = useState(null);

  // Pay Form
  const [paymentMethod, setPaymentMethod] = useState('CARD'); // 'CARD' | 'UPI' | 'CASH' | 'ONLINE'
  const [transactionId, setTransactionId] = useState('');
  const [waiveRemarks, setWaiveRemarks] = useState('');

  const fetchFines = async () => {
    try {
      setLoading(true);
      let res;
      if (isMember) {
        res = await api.get(`/fines/member/${user.id}`);
      } else {
        res = await api.get('/fines', {
          params: { query: searchQuery, status: selectedStatus },
        });
      }

      if (res.data && res.data.data) {
        setFines(res.data.data);
      }

      if (!isMember) {
        const statsRes = await api.get('/fines/stats');
        if (statsRes.data && statsRes.data.data) {
          setStats(statsRes.data.data);
        }
      }
    } catch (err) {
      console.error('Error fetching fines:', err);
      showToast('Failed to load fines data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFines();
  }, [searchQuery, selectedStatus, isMember, user?.id]);

  const handleOpenPayModal = (fine) => {
    setSelectedFine(fine);
    setPaymentMethod('CARD');
    setTransactionId(`TXN-${Math.floor(100000 + Math.random() * 900000)}`);
    setIsPayModalOpen(true);
  };

  const handleOpenWaiveModal = (fine) => {
    setSelectedFine(fine);
    setWaiveRemarks('Administrative courtesy waiver');
    setIsWaiveModalOpen(true);
  };

  const handlePaySubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/fines/${selectedFine.id}/pay`, {
        paymentMethod,
        transactionId,
      });
      showToast(`Fine of ₹${selectedFine.amount.toFixed(2)} settled successfully!`, 'success');
      setIsPayModalOpen(false);
      fetchFines();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to process payment', 'error');
    }
  };

  const handleWaiveSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/fines/${selectedFine.id}/waive?remarks=${encodeURIComponent(waiveRemarks)}`);
      showToast(`Fine of ₹${selectedFine.amount.toFixed(2)} waived`, 'info');
      setIsWaiveModalOpen(false);
      fetchFines();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to waive fine', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Stats Header (Admin/Librarian view) */}
      {!isMember && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <StatCard
            title="Total Outstanding Fines"
            value={`₹${(stats?.totalPendingFines || 0).toFixed(2)}`}
            icon={DollarSign}
            color="rose"
            subtitle="Unpaid late fees across members"
          />
          <StatCard
            title="Total Fines Collected"
            value={`₹${(stats?.totalCollectedFines || 0).toFixed(2)}`}
            icon={Receipt}
            color="emerald"
            subtitle="Revenue deposited to library fund"
          />
          <StatCard
            title="Fine Policy Rate"
            value="₹10.00 / day"
            icon={Sparkles}
            color="indigo"
            subtitle="Calculated automatically on late return"
          />
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
        {!isMember && (
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by member name, username, or book title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm"
            />
          </div>
        )}

        <div className="flex items-center gap-3 ml-auto">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2.5 rounded-xl glass-input text-sm text-slate-300"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending (Unpaid)</option>
            <option value="PAID">Paid</option>
            <option value="WAIVED">Waived</option>
          </select>
        </div>
      </div>

      {/* Fines Ledger Table */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-slate-400 bg-slate-800/40 border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">Fine Details</th>
                  {!isMember && <th className="px-4 py-3.5 font-semibold">Member</th>}
                  <th className="px-4 py-3.5 font-semibold">Days Overdue</th>
                  <th className="px-4 py-3.5 font-semibold">Fine Amount</th>
                  <th className="px-4 py-3.5 font-semibold">Assessed Date</th>
                  <th className="px-4 py-3.5 font-semibold">Status</th>
                  <th className="px-5 py-3.5 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {fines.length === 0 ? (
                  <tr>
                    <td colSpan={isMember ? '6' : '7'} className="px-4 py-8 text-center text-slate-500 text-xs">
                      No fine records found.
                    </td>
                  </tr>
                ) : (
                  fines.map((fine) => (
                    <tr key={fine.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="font-bold text-white text-sm">{fine.borrowRecord?.book?.title}</p>
                        <p className="text-xs text-slate-400 font-mono">
                          Borrow Record #{fine.borrowRecord?.id}
                          {fine.transactionId && ` • Ref: ${fine.transactionId}`}
                        </p>
                      </td>
                      {!isMember && (
                        <td className="px-4 py-3.5">
                          <p className="font-semibold text-slate-200 text-sm">{fine.member?.fullName}</p>
                          <p className="text-xs text-slate-400">@{fine.member?.username}</p>
                        </td>
                      )}
                      <td className="px-4 py-3.5 text-xs text-slate-300 font-semibold">
                        {fine.daysOverdue} days
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-base font-extrabold text-white">
                          ₹{fine.amount.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-slate-400">
                        <p>{fine.fineDate}</p>
                        {fine.paidDate && (
                          <p className="text-emerald-400 text-[11px] font-medium">
                            Paid: {fine.paidDate} ({fine.paymentMethod})
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={fine.status} />
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {fine.status === 'PENDING' ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenPayModal(fine)}
                              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-1"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              <span>Pay Fine</span>
                            </button>
                            {isAdmin && (
                              <button
                                onClick={() => handleOpenWaiveModal(fine)}
                                className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                              >
                                Waive
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500 italic">Settled</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pay Fine Modal */}
      <Modal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        title="Fine Settlement Checkout"
        maxWidth="max-w-md"
      >
        <form onSubmit={handlePaySubmit} className="space-y-5">
          {/* Summary Box */}
          <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between">
            <div>
              <p className="text-xs text-indigo-300 font-semibold uppercase tracking-wider">Total Amount Due</p>
              <h4 className="text-2xl font-extrabold text-white mt-0.5">
                ₹{selectedFine?.amount.toFixed(2)}
              </h4>
            </div>
            <div className="text-right text-xs text-slate-400">
              <p>{selectedFine?.daysOverdue} Days Late</p>
              <p className="text-slate-300 font-medium">@{selectedFine?.member?.username}</p>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Select Payment Method
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('CARD')}
                className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                  paymentMethod === 'CARD'
                    ? 'bg-indigo-600/20 border-indigo-500 text-white'
                    : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:border-slate-600'
                }`}
              >
                <CreditCard className="w-4 h-4 text-indigo-400 shrink-0" />
                <span className="text-xs font-semibold">Credit/Debit Card</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('UPI')}
                className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                  paymentMethod === 'UPI'
                    ? 'bg-indigo-600/20 border-indigo-500 text-white'
                    : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:border-slate-600'
                }`}
              >
                <QrCode className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-xs font-semibold">UPI / QR Scan</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('CASH')}
                className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                  paymentMethod === 'CASH'
                    ? 'bg-indigo-600/20 border-indigo-500 text-white'
                    : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:border-slate-600'
                }`}
              >
                <Banknote className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-xs font-semibold">Cash at Desk</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('ONLINE')}
                className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                  paymentMethod === 'ONLINE'
                    ? 'bg-indigo-600/20 border-indigo-500 text-white'
                    : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:border-slate-600'
                }`}
              >
                <Receipt className="w-4 h-4 text-sky-400 shrink-0" />
                <span className="text-xs font-semibold">Net Banking</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Transaction ID / Receipt Reference
            </label>
            <input
              type="text"
              required
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl glass-input text-sm font-mono"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsPayModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm & Mark as Paid</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Waive Fine Modal (Admin) */}
      <Modal
        isOpen={isWaiveModalOpen}
        onClose={() => setIsWaiveModalOpen(false)}
        title="Waive Late Fine"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleWaiveSubmit} className="space-y-4">
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
            <p>
              You are about to waive the fine of <strong>₹{selectedFine?.amount.toFixed(2)}</strong> for member <strong>{selectedFine?.member?.fullName}</strong>.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Justification / Reason</label>
            <input
              type="text"
              required
              value={waiveRemarks}
              onChange={(e) => setWaiveRemarks(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl glass-input text-sm"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsWaiveModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-lg shadow-amber-600/30 transition-all"
            >
              Confirm Waiver
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
