import React from 'react';

export const StatCard = ({ title, value, icon: Icon, color = 'indigo', subtitle, trend }) => {
  const colorMap = {
    indigo: {
      bg: 'bg-indigo-500/10',
      border: 'border-indigo-500/20',
      text: 'text-indigo-400',
      glow: 'group-hover:border-indigo-500/40',
    },
    emerald: {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      text: 'text-emerald-400',
      glow: 'group-hover:border-emerald-500/40',
    },
    rose: {
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/20',
      text: 'text-rose-400',
      glow: 'group-hover:border-rose-500/40',
    },
    amber: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      text: 'text-amber-400',
      glow: 'group-hover:border-amber-500/40',
    },
    cyan: {
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/20',
      text: 'text-cyan-400',
      glow: 'group-hover:border-cyan-500/40',
    },
  };

  const scheme = colorMap[color] || colorMap.indigo;

  return (
    <div className={`group relative p-6 rounded-2xl bg-slate-900/80 border border-slate-800 transition-all duration-300 hover:shadow-2xl hover:-translate-y-0.5 ${scheme.glow}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-400 tracking-wide">{title}</span>
        <div className={`p-3 rounded-xl border ${scheme.bg} ${scheme.border} ${scheme.text}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      
      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-3xl font-extrabold text-white tracking-tight">{value}</span>
        {trend && (
          <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
            {trend}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
      )}
    </div>
  );
};
