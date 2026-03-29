import React from 'react';
import { motion } from 'framer-motion';
import type { TodoStats } from '../../types';

interface StatsBarProps {
  stats: TodoStats | null;
  loading: boolean;
}

export default function StatsBar({ stats, loading }: StatsBarProps) {
  const items = [
    { label: 'Total', value: stats?.total ?? 0, color: 'text-white/60', bg: 'bg-white/5' },
    { label: 'Pending', value: stats?.pending ?? 0, color: 'text-slate-400', bg: 'bg-slate-400/10' },
    { label: 'In Progress', value: stats?.inProgress ?? 0, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: 'Completed', value: stats?.completed ?? 0, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { label: 'Cancelled', value: stats?.cancelled ?? 0, color: 'text-red-400', bg: 'bg-red-400/10' },
  ];

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {items.map((item, i) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl ${item.bg} border border-white/[0.06]`}
        >
          <span className={`text-lg font-bold font-mono leading-none ${item.color}`}>
            {loading ? '–' : item.value}
          </span>
          <span className="text-white/30 text-xs">{item.label}</span>
        </motion.div>
      ))}
    </div>
  );
}