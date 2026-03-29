import React from 'react';
import type { Priority, TodoStatus, TodoFilterRequest } from '../../types';

interface FilterBarProps {
  filter: TodoFilterRequest;
  onChange: (f: Partial<TodoFilterRequest>) => void;
  tags: string[];
}

const PRIORITIES: Priority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

export default function FilterBar({ filter, onChange, tags }: FilterBarProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Search */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder="Search tasks…"
          value={filter.search || ''}
          onChange={(e) => onChange({ search: e.target.value })}
          className="pl-8 pr-3 py-1.5 bg-white/[0.05] border border-white/[0.08] rounded-xl text-white/80 text-sm placeholder-white/20 focus:outline-none focus:border-violet-500/40 focus:ring-1 focus:ring-violet-500/20 transition-all w-48"
        />
      </div>

      {/* Priority filter */}
      <select
        value={filter.priority || ''}
        onChange={(e) => onChange({ priority: (e.target.value as Priority) || undefined })}
        className="filter-select"
      >
        <option value="">All priorities</option>
        {PRIORITIES.map((p) => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>

      {/* Tag filter */}
      {tags.length > 0 && (
        <select
          value={filter.tag || ''}
          onChange={(e) => onChange({ tag: e.target.value || undefined })}
          className="filter-select"
        >
          <option value="">All tags</option>
          {tags.map((t) => (
            <option key={t} value={t}>#{t}</option>
          ))}
        </select>
      )}

      {/* Clear */}
      {(filter.search || filter.priority || filter.tag) && (
        <button
          onClick={() => onChange({ search: undefined, priority: undefined, tag: undefined })}
          className="px-3 py-1.5 text-xs text-white/30 hover:text-white/60 bg-white/[0.04] border border-white/[0.07] rounded-xl transition-all hover:border-white/15"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}