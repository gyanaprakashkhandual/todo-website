import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Todo, TodoStatus } from "../../types";
import KanbanCard from "./Kanban.card";

interface KanbanColumnProps {
  id: TodoStatus;
  title: string;
  color: string; // hex color for column accent
  headerBg: string; // tailwind classes for header accent
  dotColor: string; // tailwind dot class
  todos: Todo[];
  onDrop: (todoId: number, status: TodoStatus) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: number) => void;
  onAddNew: (status: TodoStatus) => void;
  draggingId: number | null;
  syncingIds?: Set<number>;
}

export default function KanbanColumn({
  id,
  title,
  headerBg,
  dotColor,
  todos,
  onDrop,
  onEdit,
  onDelete,
  onAddNew,
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
    // Only fire if leaving the column entirely
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(false);
    const todoId = Number(e.dataTransfer.getData("todoId"));
    if (todoId) onDrop(todoId, id);
  };

  return (
    <div className="flex flex-col w-[272px] min-w-[272px]">
      {/* Column header */}
      <div
        className={`flex items-center justify-between px-3 py-2 mb-2 rounded-lg ${headerBg}`}
      >
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColor}`} />
          <h2 className="text-gray-900 dark:text-gray-100 text-sm font-semibold">
            {title}
          </h2>
          <span className="text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full px-2 py-0.5 font-mono leading-none">
            {todos.length}
          </span>
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => onAddNew(id)}
          className="w-6 h-6 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-white dark:hover:bg-gray-700 rounded transition-all"
          title={`Add to ${title}`}
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
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
        className={`
          flex-1 min-h-[100px] rounded-lg p-2 space-y-2 transition-all duration-150
          ${
            isOver
              ? "bg-blue-50 dark:bg-blue-900/20 border-2 border-dashed border-blue-300 dark:border-blue-600 shadow-inner"
              : "bg-gray-50 dark:bg-gray-800/40 border-2 border-transparent"
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
              isSyncing={syncingIds.has(todo.id)}
            />
          ))}
        </AnimatePresence>

        {/* Empty state */}
        {todos.length === 0 && !isOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col items-center justify-center py-10 text-center"
          >
            <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center mb-2">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="text-gray-400 dark:text-gray-500"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <line x1="9" y1="9" x2="15" y2="9" />
                <line x1="9" y1="13" x2="13" y2="13" />
              </svg>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              No tasks here
            </p>
            <button
              onClick={() => onAddNew(id)}
              className="mt-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              + Add one
            </button>
          </motion.div>
        )}

        {/* Drop hint */}
        <AnimatePresence>
          {isOver && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 44 }}
              exit={{ opacity: 0, height: 0 }}
              className="border-2 border-dashed border-blue-300 dark:border-blue-600 rounded-lg flex items-center justify-center"
            >
              <span className="text-xs text-blue-500 dark:text-blue-400 font-medium">
                Drop here
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
