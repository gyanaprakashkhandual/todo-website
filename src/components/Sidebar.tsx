import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Flag, Link as LinkIcon, Tag, Clock } from "lucide-react";
import { useTodo } from "../../context/Todo.context";
import type { Todo } from "../../types";
import { formatStatus, formatDate, isOverdue } from "./KanbanCard"; // reuse your helpers if possible, or duplicate

interface TodoDetailSidebarProps {
  onEdit?: (todo: Todo) => void;
  onDelete?: (id: number) => void;
}

export default function TodoDetailSidebar({
  onEdit,
  onDelete,
}: TodoDetailSidebarProps) {
  const { selectedTodo, setSelectedTodo } = useTodo();

  const todo = selectedTodo;
  if (!todo) return null;

  const overdue = isOverdue(todo.endDate) &&
    todo.status !== "COMPLETED" &&
    todo.status !== "CANCELLED";

  const pc = PRIORITY_CONFIG[todo.priority]; // reuse your PRIORITY_CONFIG or import it

  return (
    <AnimatePresence>
      {todo && (
        <motion.div
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-[#1e1e1e] border-l border-gray-200 dark:border-gray-800 shadow-2xl z-[100] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800">
            <div>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${pc.badgeClasses}`}>
                {pc.label} Priority
              </span>
            </div>
            <button
              onClick={() => setSelectedTodo(null)}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {/* Title */}
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 leading-tight">
              {todo.title}
            </h1>

            {/* Status */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-950 rounded-2xl">
                <div className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse" />
                <span className="font-medium text-indigo-700 dark:text-indigo-300">
                  {formatStatus(todo.status || "NOT_STARTED")}
                </span>
              </div>
            </div>

            {/* Description */}
            {todo.description && (
              <div>
                <h3 className="text-sm uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">Description</h3>
                <p className="text-[15px] leading-relaxed text-gray-700 dark:text-gray-300">
                  {todo.description}
                </p>
              </div>
            )}

            {/* Deadline */}
            <div className="flex items-start gap-4">
              <div className="mt-0.5">
                <Calendar className={`w-5 h-5 ${overdue ? "text-red-500" : "text-gray-400"}`} />
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-500 dark:text-gray-400">Due Date</div>
                <div className={`font-medium ${overdue ? "text-red-600 dark:text-red-400" : ""}`}>
                  {todo.endDate ? formatDate(todo.endDate) : "No deadline"}
                </div>
                {overdue && (
                  <div className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Overdue
                  </div>
                )}
              </div>
            </div>

            {/* Tags */}
            {todo.tags.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">Tags</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {todo.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 text-sm rounded-xl"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Reference Link */}
            {todo.refLink && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <LinkIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">Reference</span>
                </div>
                <a
                  href={todo.refLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 dark:text-indigo-400 hover:underline break-all text-[15px]"
                >
                  {todo.refLink}
                </a>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="border-t border-gray-100 dark:border-gray-800 p-6 flex gap-3">
            <button
              onClick={() => {
                onEdit?.(todo);
                // Optionally close sidebar after edit opens
              }}
              className="flex-1 py-3.5 text-sm font-semibold bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800 rounded-2xl transition-all active:scale-[0.985]"
            >
              Edit Task
            </button>

            <button
              onClick={() => {
                if (confirm("Delete this task?")) {
                  onDelete?.(todo.id);
                  setSelectedTodo(null);
                }
              }}
              className="flex-1 py-3.5 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-2xl transition-all active:scale-[0.985]"
            >
              Delete
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}