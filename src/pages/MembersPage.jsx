import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  UserPlus,
  Edit2,
  Trash2,
  Shield,
  Ban,
  CheckCircle,
  BookOpen,
  DollarSign,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock
} from 'lucide-react';
import api from '../api/axios';
import { RoleBadge, StatusBadge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const MembersPage = () => {
  const { user: currentUser, isAdmin } = useAuth();
  const { showToast } = useToast();

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [selectedMember, setSelectedMember] = useState(null);
  const [memberLoans, setMemberLoans] = useState([]);
  const [memberFines, setMemberFines] = useState([]);

  // Form
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    phone: '',
    address: '',
    role: 'ROLE_MEMBER',
    status: 'ACTIVE',
  });

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/members', {
        params: { query: searchQuery },
      });
      if (res.data && res.data.data) {
        setMembers(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching members:', err);
      showToast('Failed to load members', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [searchQuery]);

  const handleOpenAddModal = () => {
    setFormData({
      username: '',
      email: '',
      password: 'Member@123',
      fullName: '',
      phone: '',
      address: '',
      role: 'ROLE_MEMBER',
      status: 'ACTIVE',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (member) => {
    setSelectedMember(member);
    setFormData({
      username: member.username,
      email: member.email,
      password: '',
      fullName: member.fullName,
      phone: member.phone || '',
      address: member.address || '',
      role: member.role,
      status: member.status,
    });
    setIsEditModalOpen(true);
  };

  const handleOpenDetails = async (member) => {
    setSelectedMember(member);
    setIsDetailModalOpen(true);
    try {
      const [loansRes, finesRes] = await Promise.all([
        api.get(`/borrow/member/${member.id}`),
        api.get(`/fines/member/${member.id}`),
      ]);
      setMemberLoans(loansRes.data.data || []);
      setMemberFines(finesRes.data.data || []);
    } catch (err) {
      console.error('Error fetching member details:', err);
    }
  };

  const handleCreateMember = async (e) => {
    e.preventDefault();
    try {
      await api.post('/members', formData);
      showToast(`Member "${formData.fullName}" created successfully!`, 'success');
      setIsAddModalOpen(false);
      fetchMembers();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create member', 'error');
    }
  };

  const handleUpdateMember = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/members/${selectedMember.id}`, formData);
      showToast(`Member profile updated!`, 'success');
      setIsEditModalOpen(false);
      fetchMembers();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update member', 'error');
    }
  };

  const handleToggleStatus = async (member) => {
    const newStatus = member.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await api.patch(`/members/${member.id}/status?status=${newStatus}`);
      showToast(`Status updated to ${newStatus}`, 'info');
      fetchMembers();
    } catch (err) {
      showToast('Failed to update member status', 'error');
    }
  };

  const handleDeleteMember = async (memberId) => {
    if (!window.confirm('Are you sure you want to permanently delete this member?')) return;
    try {
      await api.delete(`/members/${memberId}`);
      showToast('Member account deleted', 'info');
      fetchMembers();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete member', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by full name, username, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm"
          />
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 justify-center"
        >
          <UserPlus className="w-4 h-4" />
          <span>Register New Member</span>
        </button>
      </div>

      {/* Members Directory Table */}
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
                  <th className="px-5 py-4 font-semibold">Member Profile</th>
                  <th className="px-4 py-4 font-semibold">Contact Info</th>
                  <th className="px-4 py-4 font-semibold">Role</th>
                  <th className="px-4 py-4 font-semibold">Active Borrows</th>
                  <th className="px-4 py-4 font-semibold">Fines Due</th>
                  <th className="px-4 py-4 font-semibold">Status</th>
                  <th className="px-5 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {members.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-sm shrink-0">
                          {m.fullName.charAt(0)}
                        </div>
                        <div>
                          <button
                            onClick={() => handleOpenDetails(m)}
                            className="font-bold text-white text-sm hover:text-indigo-400 transition-colors text-left"
                          >
                            {m.fullName}
                          </button>
                          <p className="text-xs text-slate-400">@{m.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-xs text-slate-300 font-medium">{m.email}</p>
                      <p className="text-[11px] text-slate-500">{m.phone || 'No phone set'}</p>
                    </td>
                    <td className="px-4 py-4">
                      <RoleBadge role={m.role} />
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${
                          m.activeBorrowsCount > 0
                            ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {m.activeBorrowsCount} books
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {m.pendingFinesAmount > 0 ? (
                        <span className="text-xs font-bold text-rose-400 bg-rose-500/15 border border-rose-500/30 px-2 py-0.5 rounded-md">
                          ₹{m.pendingFinesAmount.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-xs text-emerald-400 font-medium">None</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={m.status} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenDetails(m)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 transition-colors"
                        >
                          Details
                        </button>
                        <button
                          onClick={() => handleToggleStatus(m)}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            m.status === 'ACTIVE'
                              ? 'text-amber-400 hover:bg-amber-500/10 border-amber-500/30'
                              : 'text-emerald-400 hover:bg-emerald-500/10 border-emerald-500/30'
                          }`}
                          title={m.status === 'ACTIVE' ? 'Suspend Member' : 'Activate Member'}
                        >
                          {m.status === 'ACTIVE' ? <Ban className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(m)}
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg border border-slate-700 transition-colors"
                          title="Edit Profile"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => handleDeleteMember(m.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg border border-slate-700 transition-colors"
                            title="Delete Member"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Member Modal */}
      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
        }}
        title={isAddModalOpen ? 'Register New Member' : `Edit Member: ${selectedMember?.fullName}`}
      >
        <form onSubmit={isAddModalOpen ? handleCreateMember : handleUpdateMember} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="John Doe"
                className="w-full px-3.5 py-2 rounded-xl glass-input text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Username *</label>
              <input
                type="text"
                required
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="johndoe"
                className="w-full px-3.5 py-2 rounded-xl glass-input text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john@example.com"
                className="w-full px-3.5 py-2 rounded-xl glass-input text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                {isAddModalOpen ? 'Initial Password *' : 'Update Password (leave blank to keep)'}
              </label>
              <input
                type="password"
                required={isAddModalOpen}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full px-3.5 py-2 rounded-xl glass-input text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 000-0000"
                className="w-full px-3.5 py-2 rounded-xl glass-input text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">System Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl glass-input text-sm text-slate-200"
              >
                <option value="ROLE_MEMBER">Member (Student / Reader)</option>
                <option value="ROLE_LIBRARIAN">Librarian</option>
                {isAdmin && <option value="ROLE_ADMIN">Administrator</option>}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Postal Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="123 Academic Way, City"
              className="w-full px-3.5 py-2 rounded-xl glass-input text-sm"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => {
                setIsAddModalOpen(false);
                setIsEditModalOpen(false);
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all"
            >
              {isAddModalOpen ? 'Create Member' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Member Details Drawer Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={`Member Details: ${selectedMember?.fullName}`}
      >
        <div className="space-y-6">
          {/* Member Card Summary */}
          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-base">
                {selectedMember?.fullName?.charAt(0)}
              </div>
              <div>
                <h4 className="text-base font-bold text-white">{selectedMember?.fullName}</h4>
                <p className="text-xs text-slate-400 font-mono">@{selectedMember?.username} • {selectedMember?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <RoleBadge role={selectedMember?.role} />
              <StatusBadge status={selectedMember?.status} />
            </div>
          </div>

          {/* Active Borrow Records */}
          <div className="space-y-2">
            <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <span>Currently Borrowed Books ({memberLoans.filter((l) => l.status === 'ISSUED').length})</span>
            </h5>

            {memberLoans.filter((l) => l.status === 'ISSUED').length === 0 ? (
              <p className="text-xs text-slate-500 p-3 rounded-xl bg-slate-800/20 border border-slate-800">
                No books currently checked out.
              </p>
            ) : (
              <div className="space-y-2">
                {memberLoans
                  .filter((l) => l.status === 'ISSUED')
                  .map((loan) => (
                    <div
                      key={loan.id}
                      className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/40 flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-bold text-white">{loan.book?.title}</p>
                        <p className="text-slate-400">Issued: {loan.issueDate} • Due: <span className="text-indigo-400 font-semibold">{loan.dueDate}</span></p>
                      </div>
                      <StatusBadge status={loan.status} />
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Fine History */}
          <div className="space-y-2">
            <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-amber-400" />
              <span>Fine Ledger ({memberFines.length})</span>
            </h5>

            {memberFines.length === 0 ? (
              <p className="text-xs text-slate-500 p-3 rounded-xl bg-slate-800/20 border border-slate-800">
                No fines or penalty records on file.
              </p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {memberFines.map((fine) => (
                  <div
                    key={fine.id}
                    className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/40 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-white">₹{fine.amount.toFixed(2)} ({fine.daysOverdue} days overdue)</p>
                      <p className="text-slate-400">Date: {fine.fineDate} {fine.paidDate && `• Paid: ${fine.paidDate}`}</p>
                    </div>
                    <StatusBadge status={fine.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};
