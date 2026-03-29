import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Todo, TodoStatus } from "../../types/index";
import KanbanCard from "./Kanban.card";

interface KanbanColumnProps {
  id: TodoStatus;
  title: string;
  color: string;
  headerBg: string;
  dotColor: string;
  todos: Todo[];
  onDrop: (todoId: number, status: TodoStatus) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: number) => void;
  onAddNew: (status: TodoStatus) => void;
  onViewDetail: (todo: Todo) => void; // ← new
  draggingId: number | null;
  syncingIds?: Set<number>;
}

export default function KanbanColumn({
  id,
  title,
  color,
  headerBg,
  dotColor,
  todos,
  onDrop,
  onEdit,
  onDelete,
  onAddNew,
  onViewDetail,
  draggingId,
  syncingIds = new Set(),
}: KanbanColumnProps) {
  const [isOver, setIsOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setIsOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(false);
    const todoId = Number(e.dataTransfer.getData("todoId"));
    if (todoId) onDrop(todoId, id);
  };

  return (
    <div className="flex flex-col w-[340px] min-w-[300px] max-w-[360px] flex-shrink-0">
      {/* Column header */}
      <div className="flex items-center justify-between px-3 py-2.5 mb-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="flex items-center gap-2.5">
          <span
            className="w-1 h-5 rounded-full shrink-0"
            style={{ backgroundColor: color }}
          />
          <h2 className="text-gray-800 dark:text-gray-100 text-[13px] font-semibold tracking-tight leading-none">
            {title}
          </h2>
          <span
            className="text-[11px] font-semibold rounded-md px-1.5 py-0.5 leading-none tabular-nums"
            style={{ backgroundColor: `${color}18`, color }}
          >
            {todos.length}
          </span>
        </div>

        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => onAddNew(id)}
          className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-white dark:hover:bg-gray-700 transition-all shadow-sm"
          title={`Add to ${title}`}
        >
          <svg
            width="11" height="11" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </motion.button>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex-1 min-h-[120px] rounded-xl p-2 space-y-2 transition-all duration-200 ${
          isOver
            ? "bg-blue-50/60 dark:bg-blue-900/10 border-2 border-dashed border-blue-300 dark:border-blue-700 shadow-inner"
            : "bg-gray-50/70 dark:bg-gray-800/30 border-2 border-transparent"
        }`}
      >
        <AnimatePresence initial={false}>
          {todos.map((todo) => (
            <KanbanCard
              key={todo.id}
              todo={todo}
              onEdit={onEdit}
              onDelete={onDelete}
              onViewDetail={onViewDetail}   // ← passed through
              isDragging={draggingId === todo.id}
              isSyncing={syncingIds.has(todo.id)}
            />
          ))}
        </AnimatePresence>

        {/* Empty state */}
        {todos.length === 0 && !isOver && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.2 }}
            className="flex flex-col items-center justify-center py-10 text-center select-none"
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
              style={{ backgroundColor: `${color}12` }}
            >
              <svg
                width="16" height="16" viewBox="0 0 24 24"
                fill="none" stroke={color} strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round"
                style={{ opacity: 0.7 }}
              >
                <rect x="3" y="3" width="18" height="18" rx="3" />
                <line x1="9" y1="9" x2="15" y2="9" />
                <line x1="9" y1="13" x2="13" y2="13" />
              </svg>
            </div>
            <p className="text-[12px] font-medium text-gray-400 dark:text-gray-500 mb-1">
              No tasks yet
            </p>
            <button
              onClick={() => onAddNew(id)}
              className="text-[11px] font-semibold transition-colors hover:underline"
              style={{ color }}
            >
              + Add task
            </button>
          </motion.div>
        )}

        {/* Drop hint */}
        <AnimatePresence>
          {isOver && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 48 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.15 }}
              className="border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-xl flex items-center justify-center overflow-hidden"
            >
              <span className="text-[11px] font-semibold text-blue-500 dark:text-blue-400 tracking-wide uppercase">
                Release to drop
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {todos.length > 0 && (
        <div className="mt-2 px-1">
          <p className="text-[10px] text-gray-400 dark:text-gray-600 text-center tracking-wide">
            {todos.length} {todos.length === 1 ? "task" : "tasks"}
          </p>
        </div>
      )}
    </div>
  );
}