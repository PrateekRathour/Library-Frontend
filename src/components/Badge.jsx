import React from 'react';

export const StatusBadge = ({ status }) => {
  const getStyle = (st) => {
    switch (st?.toUpperCase()) {
      case 'AVAILABLE':
      case 'ACTIVE':
      case 'PAID':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'OUT_OF_STOCK':
      case 'SUSPENDED':
      case 'OVERDUE':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      case 'ISSUED':
      case 'PENDING':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'RETURNED':
      case 'WAIVED':
        return 'bg-sky-500/15 text-sky-400 border-sky-500/30';
      default:
        return 'bg-slate-700/40 text-slate-300 border-slate-600/30';
    }
  };

  const formatText = (st) => {
    if (!st) return 'N/A';
    return st.replace(/_/g, ' ');
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border ${getStyle(
        status
      )}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-80" />
      {formatText(status)}
    </span>
  );
};

export const RoleBadge = ({ role }) => {
  const getStyle = (r) => {
    switch (r) {
      case 'ROLE_ADMIN':
        return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
      case 'ROLE_LIBRARIAN':
        return 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30';
      case 'ROLE_MEMBER':
        return 'bg-blue-500/15 text-blue-300 border-blue-500/30';
      default:
        return 'bg-slate-700/40 text-slate-300 border-slate-600/30';
    }
  };

  const getLabel = (r) => {
    if (r === 'ROLE_ADMIN') return 'Administrator';
    if (r === 'ROLE_LIBRARIAN') return 'Librarian';
    if (r === 'ROLE_MEMBER') return 'Member';
    return r;
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStyle(
        role
      )}`}
    >
      {getLabel(role)}
    </span>
  );
};
