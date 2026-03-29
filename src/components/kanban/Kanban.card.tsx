import { motion } from "framer-motion";
import type { Todo, Priority } from "../../types";

interface KanbanCardProps {
  todo: Todo;
  onEdit: (todo: Todo) => void;
  onDelete: (id: number) => void;
  isDragging?: boolean;
  isSyncing?: boolean;
}

const PRIORITY_CONFIG: Record<
  Priority,
  { label: string; textColor: string; badgeBg: string; dot: string }
> = {
  LOW: {
    label: "Low",
    textColor: "text-green-700 dark:text-green-400",
    badgeBg:
      "bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800",
    dot: "bg-green-500",
  },
  MEDIUM: {
    label: "Medium",
    textColor: "text-yellow-700 dark:text-yellow-400",
    badgeBg:
      "bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800",
    dot: "bg-yellow-500",
  },
  HIGH: {
    label: "High",
    textColor: "text-orange-700 dark:text-orange-400",
    badgeBg:
      "bg-orange-50 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800",
    dot: "bg-orange-500",
  },
  URGENT: {
    label: "Urgent",
    textColor: "text-red-700 dark:text-red-400",
    badgeBg: "bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800",
    dot: "bg-red-500",
  },
};

function formatDate(d?: string) {
  if (!d) return null;
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y.slice(2)}`;
}

function isOverdue(endDate?: string): boolean {
  if (!endDate) return false;
  return new Date(endDate) < new Date();
}

export default function KanbanCard({
  todo,
  onEdit,
  onDelete,
  isDragging,
  isSyncing,
}: KanbanCardProps) {
  const pc = PRIORITY_CONFIG[todo.priority];
  const overdue =
    isOverdue(todo.endDate) &&
    todo.status !== "COMPLETED" &&
    todo.status !== "CANCELLED";

  return (
    <motion.div
      layout
      layoutId={`card-${todo.id}`}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className={`
        group relative bg-white dark:bg-gray-800 border rounded-lg p-3 cursor-grab active:cursor-grabbing
        transition-all duration-150 select-none
        ${
          isDragging
            ? "border-blue-400 dark:border-blue-500 shadow-lg shadow-blue-100 dark:shadow-blue-900/30 rotate-1 scale-[1.02] z-50"
            : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md hover:shadow-gray-100 dark:hover:shadow-gray-900/50"
        }
        ${isSyncing ? "opacity-70" : "opacity-100"}
      `}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("todoId", String(todo.id));
        e.dataTransfer.effectAllowed = "move";
      }}
    >
      {/* Sync indicator */}
      {isSyncing && (
        <div className="absolute top-2 right-2">
          <svg
            className="animate-spin w-3 h-3 text-gray-400"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
              strokeDasharray="60"
              strokeDashoffset="20"
            />
          </svg>
        </div>
      )}

      {/* Header row: priority badge + actions */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <span
          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-semibold uppercase tracking-wide ${pc.badgeBg} ${pc.textColor}`}
        >
          <span className={`w-1 h-1 rounded-full ${pc.dot}`} />
          {pc.label}
        </span>

        {/* Actions */}
        <div
          className={`flex items-center gap-0.5 transition-opacity ${isSyncing ? "opacity-0" : "opacity-0 group-hover:opacity-100"}`}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(todo);
            }}
            className="p-1 rounded text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
            title="Edit"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(todo.id);
            }}
            className="p-1 rounded text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
            title="Delete"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="3,6 5,6 21,6" />
              <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a1,1,0,0,1,1-1h4a1,1,0,0,1,1,1v2" />
            </svg>
          </button>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-gray-900 dark:text-gray-100 text-sm font-medium leading-snug mb-1.5 line-clamp-2">
        {todo.title}
      </h3>

      {/* Description */}
      {todo.description && (
        <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed line-clamp-2 mb-2">
          {todo.description}
        </p>
      )}

      {/* Tags */}
      {todo.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {todo.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-gray-600 dark:text-gray-300 text-[10px] font-medium"
            >
              #{tag}
            </span>
          ))}
          {todo.tags.length > 3 && (
            <span className="px-1.5 py-0.5 text-gray-400 dark:text-gray-500 text-[10px]">
              +{todo.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      {(todo.endDate || todo.refLink) && (
        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700 mt-1">
          {todo.endDate && (
            <span
              className={`flex items-center gap-1 text-[10px] font-medium ${overdue ? "text-red-600 dark:text-red-400" : "text-gray-400 dark:text-gray-500"}`}
            >
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              {overdue && <span>⚠ </span>}
              {formatDate(todo.endDate)}
            </span>
          )}
          {todo.refLink && (
            <a
              href={todo.refLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-[10px] text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors flex items-center gap-0.5 font-medium"
            >
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15,3 21,3 21,9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              Link
            </a>
          )}
        </div>
      )}
    </motion.div>
  );
}
