import React from 'react';
import { motion } from 'framer-motion';
import type { Todo, Priority } from '../../types';

interface KanbanCardProps {
  todo: Todo;
  onEdit: (todo: Todo) => void;
  onDelete: (id: number) => void;
  isDragging?: boolean;
}

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; dot: string }> = {
  LOW: { label: 'Low', color: 'text-emerald-400', dot: 'bg-emerald-400' },
  MEDIUM: { label: 'Medium', color: 'text-amber-400', dot: 'bg-amber-400' },
  HIGH: { label: 'High', color: 'text-orange-400', dot: 'bg-orange-400' },
  URGENT: { label: 'Urgent', color: 'text-red-400', dot: 'bg-red-400' },
};

function formatDate(d?: string) {
  if (!d) return null;
  const [y, m, day] = d.split('-');
  return `${day}/${m}/${y.slice(2)}`;
}

function isOverdue(endDate?: string): boolean {
  if (!endDate) return false;
  return new Date(endDate) < new Date();
}

export default function KanbanCard({ todo, onEdit, onDelete, isDragging }: KanbanCardProps) {
  const pc = PRIORITY_CONFIG[todo.priority];
  const overdue = isOverdue(todo.endDate) && todo.status !== 'COMPLETED' && todo.status !== 'CANCELLED';

  return (
    <motion.div
      layout
      layoutId={`card-${todo.id}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.18 }}
      className={`
        group relative bg-[#16161f] border rounded-xl p-3.5 cursor-grab active:cursor-grabbing
        transition-all duration-150
        ${isDragging
          ? 'border-violet-500/50 shadow-xl shadow-violet-500/10 rotate-1 scale-[1.02]'
          : 'border-white/[0.08] hover:border-white/[0.15] hover:shadow-lg hover:shadow-black/30'
        }
      `}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('todoId', String(todo.id));
        e.dataTransfer.effectAllowed = 'move';
      }}
    >
      {/* Priority indicator */}
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-0.5 ${pc.dot}`} />
          <span className={`text-[10px] font-semibold uppercase tracking-wider ${pc.color}`}>
            {pc.label}
          </span>
        </div>

        {/* Actions - visible on hover */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(todo); }}
            className="p-1 rounded-lg text-white/30 hover:text-white/80 hover:bg-white/[0.08] transition-all"
            title="Edit"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(todo.id); }}
            className="p-1 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-all"
            title="Delete"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3,6 5,6 21,6" /><path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a1,1,0,0,1,1-1h4a1,1,0,0,1,1,1v2" />
            </svg>
          </button>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-white/90 text-sm font-medium leading-snug mb-2 line-clamp-2">
        {todo.title}
      </h3>

      {/* Description */}
      {todo.description && (
        <p className="text-white/35 text-xs leading-relaxed line-clamp-2 mb-2.5">
          {todo.description}
        </p>
      )}

      {/* Tags */}
      {todo.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2.5">
          {todo.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-1.5 py-0.5 bg-violet-500/10 border border-violet-500/15 rounded-full text-violet-400/70 text-[10px]"
            >
              #{tag}
            </span>
          ))}
          {todo.tags.length > 3 && (
            <span className="px-1.5 py-0.5 text-white/20 text-[10px]">+{todo.tags.length - 3}</span>
          )}
        </div>
      )}

      {/* Footer */}
      {(todo.endDate || todo.refLink) && (
        <div className="flex items-center justify-between mt-1 pt-2.5 border-t border-white/[0.05]">
          {todo.endDate && (
            <span className={`flex items-center gap-1 text-[10px] ${overdue ? 'text-red-400' : 'text-white/30'}`}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              {overdue ? '⚠ ' : ''}{formatDate(todo.endDate)}
            </span>
          )}
          {todo.refLink && (
            <a
              href={todo.refLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-[10px] text-indigo-400/60 hover:text-indigo-400 transition-colors flex items-center gap-0.5"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15,3 21,3 21,9" /><line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              Link
            </a>
          )}
        </div>
      )}
    </motion.div>
  );
}