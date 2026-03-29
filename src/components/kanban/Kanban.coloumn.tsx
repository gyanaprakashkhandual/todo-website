import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Todo, TodoStatus } from '../../types';
import KanbanCard from './Kanban.card';

interface KanbanColumnProps {
  id: TodoStatus;
  title: string;
  accent: string;
  todos: Todo[];
  onDrop: (todoId: number, status: TodoStatus) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: number) => void;
  onAddNew: (status: TodoStatus) => void;
  draggingId: number | null;
}

export default function KanbanColumn({
  id, title, accent, todos, onDrop, onEdit, onDelete, onAddNew, draggingId,
}: KanbanColumnProps) {
  const [isOver, setIsOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsOver(true);
  };

  const handleDragLeave = () => setIsOver(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(false);
    const todoId = Number(e.dataTransfer.getData('todoId'));
    if (todoId) onDrop(todoId, id);
  };

  return (
    <div className="flex flex-col min-w-[280px] w-[280px]">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${accent}`} />
          <h2 className="text-white/70 text-sm font-semibold tracking-wide">
            {title}
          </h2>
          <span className="text-white/20 text-xs bg-white/[0.05] rounded-full px-2 py-0.5 font-mono">
            {todos.length}
          </span>
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => onAddNew(id)}
          className="w-6 h-6 flex items-center justify-center text-white/20 hover:text-white/60 hover:bg-white/[0.06] rounded-lg transition-all"
          title={`Add to ${title}`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </motion.button>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          flex-1 min-h-[120px] rounded-2xl p-2 space-y-2 transition-all duration-200
          ${isOver
            ? 'bg-violet-500/[0.06] border border-dashed border-violet-500/40 shadow-inner shadow-violet-500/5'
            : 'bg-white/[0.02] border border-transparent'
          }
        `}
      >
        <AnimatePresence initial={false}>
          {todos.map((todo) => (
            <KanbanCard
              key={todo.id}
              todo={todo}
              onEdit={onEdit}
              onDelete={onDelete}
              isDragging={draggingId === todo.id}
            />
          ))}
        </AnimatePresence>

        {/* Empty state */}
        {todos.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-10 text-center"
          >
            <div className={`w-8 h-8 rounded-xl ${accent.replace('bg-', 'bg-').replace('-400', '-400/10')} flex items-center justify-center mb-2`}>
              <span className={`text-base ${accent.replace('bg-', 'text-')}`}>○</span>
            </div>
            <p className="text-white/15 text-xs">Drop tasks here</p>
          </motion.div>
        )}

        {/* Drop hint when dragging */}
        {isOver && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 40 }}
            className="border-2 border-dashed border-violet-500/30 rounded-xl flex items-center justify-center"
          >
            <span className="text-violet-400/50 text-xs">Release to move</span>
          </motion.div>
        )}
      </div>
    </div>
  );
}