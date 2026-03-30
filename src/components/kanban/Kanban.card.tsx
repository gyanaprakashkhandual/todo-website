import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import type { Todo, Priority } from "../../types/index";
import { useConfirm } from "../../context/Confirm.context";
import {
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  Tag,
  CalendarDays,
  AlertCircle,
  ChevronUp,
  Minus,
  ArrowUp,
  Flame,
  ExternalLink,
} from "lucide-react";

interface KanbanCardProps {
  todo: Todo;
  onEdit: (todo: Todo) => void;
  onDelete: (id: number) => void;
  onViewDetail: (todo: Todo) => void;
  isDragging?: boolean;
  isSyncing?: boolean;
}

const PRIORITY_CONFIG: Record<
  Priority,
  {
    label: string;
    badgeClasses: string;
    dotColor: string;
    icon: React.ReactNode;
  }
> = {
  LOW: {
    label: "Low",
    dotColor: "#6366f1",
    badgeClasses:
      "bg-indigo-50 text-indigo-600 border border-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800/40",
    icon: <Minus className="w-2.5 h-2.5" />,
  },
  MEDIUM: {
    label: "Medium",
    dotColor: "#d97706",
    badgeClasses:
      "bg-amber-50 text-amber-700 border border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/40",
    icon: <ChevronUp className="w-2.5 h-2.5" />,
  },
  HIGH: {
    label: "High",
    dotColor: "#ea580c",
    badgeClasses:
      "bg-orange-50 text-orange-700 border border-orange-100 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800/40",
    icon: <ArrowUp className="w-2.5 h-2.5" />,
  },
  URGENT: {
    label: "Urgent",
    dotColor: "#dc2626",
    badgeClasses:
      "bg-red-50 text-red-700 border border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/40",
    icon: <Flame className="w-2.5 h-2.5" />,
  },
};

const STATUS_COLOR: Record<string, { bg: string; dot: string; text: string }> =
  {
    PENDING: {
      bg: "bg-slate-100 dark:bg-slate-800/50",
      dot: "bg-slate-400",
      text: "text-slate-600 dark:text-slate-400",
    },
    IN_PROGRESS: {
      bg: "bg-blue-50 dark:bg-blue-900/20",
      dot: "bg-blue-500",
      text: "text-blue-700 dark:text-blue-400",
    },
    COMPLETED: {
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
      dot: "bg-emerald-500",
      text: "text-emerald-700 dark:text-emerald-400",
    },
    CANCELLED: {
      bg: "bg-gray-100 dark:bg-gray-800/50",
      dot: "bg-gray-400",
      text: "text-gray-500 dark:text-gray-500",
    },
  };

function formatStatus(status: string) {
  return status
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function formatDate(d?: string) {
  if (!d) return null;
  const [y, m, day] = d.split("-");
  return new Date(Number(y), Number(m) - 1, Number(day)).toLocaleDateString(
    "en-GB",
    { day: "2-digit", month: "short", year: "numeric" },
  );
}

function isOverdue(endDate?: string, status?: string): boolean {
  if (!endDate || status === "COMPLETED" || status === "CANCELLED")
    return false;
  return new Date(endDate) < new Date();
}

export default function KanbanCard({
  todo,
  onEdit,
  onDelete,
  isDragging,
  isSyncing,
}: KanbanCardProps) {
  const navigate = useNavigate();
  const { showConfirm } = useConfirm();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const pc = PRIORITY_CONFIG[todo.priority];
  const sc = STATUS_COLOR[todo.status] ?? STATUS_COLOR["PENDING"];
  const overdue = isOverdue(todo.endDate, todo.status);
  const dueDate = formatDate(todo.endDate);
  const startDate = formatDate(todo.startDate);
  const link = todo.refLink ? `https://${todo.refLink}` : undefined;

  useEffect(() => {
    if (!menuOpen) return;
    function handleOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [menuOpen]);

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    navigate(`/todo/${todo.id}`);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    onEdit(todo);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    const confirmed = await showConfirm({
      title: "Delete Task",
      message: `Are you sure you want to delete "${todo.title}"? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      type: "danger",
    });
    if (confirmed) onDelete(todo.id);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -6, scale: 0.98 }}
      animate={{ opacity: isSyncing ? 0.55 : 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, y: 4 }}
      transition={{ duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={!isDragging ? { y: -1, transition: { duration: 0.12 } } : {}}
      draggable
      onDragStart={(e: React.DragEvent) => {
        e.dataTransfer.setData("todoId", String(todo.id));
        e.dataTransfer.effectAllowed = "move";

        const priorityColors: Record<
          Priority,
          { bg: string; text: string; border: string }
        > = {
          LOW: { bg: "#eef2ff", text: "#4338ca", border: "#c7d2fe" },
          MEDIUM: { bg: "#fffbeb", text: "#b45309", border: "#fde68a" },
          HIGH: { bg: "#fff7ed", text: "#c2410c", border: "#fed7aa" },
          URGENT: { bg: "#fef2f2", text: "#b91c1c", border: "#fecaca" },
        };

        const pc = priorityColors[todo.priority];

        const accentColors: Record<Priority, string> = {
          LOW: "#6366f1",
          MEDIUM: "#f59e0b",
          HIGH: "#ea580c",
          URGENT: "#ef4444",
        };

        const accent = accentColors[todo.priority];

        const ghost = document.createElement("div");
        ghost.innerHTML = `
    <div style="
      width: 280px;
      background: #ffffff;
      border: 0.5px solid #e2e8f0;
      border-radius: 12px;
      box-shadow: 0 16px 40px rgba(0,0,0,0.13), 0 4px 12px rgba(0,0,0,0.07);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      transform: rotate(1.5deg) scale(1.02);
      overflow: hidden;
      position: relative;
    ">
      <div style="
        position: absolute;
        left: 0; top: 12px; bottom: 12px;
        width: 3px;
        border-radius: 0 2px 2px 0;
        background: ${accent};
      "></div>

      <div style="padding: 11px 12px 10px 16px;">

        <div style="display:flex; align-items:center; gap:5px; margin-bottom:8px; flex-wrap:nowrap;">
          <span style="
            display:inline-flex; align-items:center; gap:4px;
            padding:3px 7px; border-radius:5px; font-size:10px; font-weight:500;
            background:#eff6ff; color:#1d4ed8;
            border: 0.5px solid #bfdbfe; line-height:1;
          ">
            <span style="width:6px;height:6px;border-radius:50%;background:#3b82f6;display:inline-block;flex-shrink:0;"></span>
            In Progress
          </span>
          <span style="
            display:inline-flex; align-items:center; gap:4px;
            padding:3px 7px; border-radius:5px; font-size:10px; font-weight:500;
            background:${pc.bg}; color:${pc.text};
            border: 0.5px solid ${pc.border}; line-height:1;
          ">
            ${todo.priority.charAt(0) + todo.priority.slice(1).toLowerCase()}
          </span>
        </div>

        <div style="
          font-size:13px; font-weight:500; color:#0f172a;
          line-height:1.35; margin-bottom:${todo.description ? "5px" : "0"};
          overflow:hidden; display:-webkit-box;
          -webkit-line-clamp:1; -webkit-box-orient:vertical;
        ">${todo.title}</div>

        ${
          todo.description
            ? `
        <div style="
          font-size:11.5px; color:#64748b; line-height:1.5;
          overflow:hidden; display:-webkit-box;
          -webkit-line-clamp:2; -webkit-box-orient:vertical;
        ">${todo.description}</div>
        `
            : ""
        }

        ${
          todo.tags?.length > 0
            ? `
        <div style="display:flex; gap:4px; flex-wrap:wrap; margin-top:7px;">
          ${todo.tags
            .slice(0, 3)
            .map(
              (tag) => `
            <span style="
              font-size:10px; font-weight:500; padding:2px 6px;
              background:#f8fafc; border:0.5px solid #e2e8f0;
              border-radius:4px; color:#64748b; line-height:1.4;
            ">${tag}</span>
          `,
            )
            .join("")}
          ${todo.tags.length > 3 ? `<span style="font-size:10px;color:#94a3b8;">+${todo.tags.length - 3}</span>` : ""}
        </div>
        `
            : ""
        }
      </div>

      ${
        todo.endDate
          ? `
      <div style="
        border-top: 0.5px solid #f1f5f9;
        padding: 7px 12px;
        display:flex; align-items:center; gap:5px;
        background:#f8fafc;
      ">
        <svg width="10" height="10" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="1" y="2" width="12" height="11" rx="2" stroke="#94a3b8" stroke-width="1.2"/>
          <path d="M1 6h12M5 1v2M9 1v2" stroke="#94a3b8" stroke-width="1.2" stroke-linecap="round"/>
        </svg>
        <span style="font-size:10px;font-weight:500;color:#64748b;">Due ${todo.endDate}</span>
      </div>
      `
          : ""
      }
    </div>
  `;

        ghost.style.position = "fixed";
        ghost.style.top = "-400px";
        ghost.style.left = "-400px";
        ghost.style.pointerEvents = "none";
        ghost.style.zIndex = "9999";
        document.body.appendChild(ghost);
        e.dataTransfer.setDragImage(ghost, 140, 40);
        setTimeout(() => document.body.removeChild(ghost), 0);
      }}
      className={`group relative bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 cursor-grab active:cursor-grabbing select-none flex flex-col gap-0 transition-shadow duration-200 ${
        isDragging
          ? "shadow-xl ring-2 ring-blue-400/40 rotate-1 scale-[1.02] z-50"
          : "shadow-sm hover:shadow-md hover:border-gray-200 dark:hover:border-gray-700"
      }`}
    >
      <span
        className="absolute left-0 top-3 bottom-3 w-0.75 rounded-full"
        style={{ backgroundColor: pc.dotColor }}
      />

      {isSyncing && (
        <div className="absolute inset-0 rounded-xl bg-white/60 dark:bg-gray-900/60 backdrop-blur-[1px] flex items-center justify-center z-10">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full"
          />
        </div>
      )}

      <div className="px-4 pt-3.5 pb-3 flex flex-col gap-2.5">
        <div className="flex items-center gap-1.5">
          <div
            className={`flex items-center gap-1.5 px-2 py-1 rounded-md ${sc.bg}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${sc.dot}`} />
            <span
              className={`text-[10px] font-semibold tracking-wide leading-none ${sc.text}`}
            >
              {formatStatus(todo.status)}
            </span>
          </div>

          <span
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold leading-none ${pc.badgeClasses}`}
          >
            {pc.icon}
            {pc.label}
          </span>

          <span>
            <Link
              to={link ?? "#"}
              target="_blank"
              onClick={(e) => {
                e.stopPropagation();
                if (!link) e.preventDefault();
              }}
              className={`text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 ${link ? "hover:underline" : "cursor-default"}`}
            >
              <ExternalLink className="w-3 h-3 text-gray-600 dark:text-gray-300" />
            </Link>
          </span>

          <div
            ref={menuRef}
            className="relative ml-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.92 }}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen((prev) => !prev);
              }}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150"
              aria-label="Card actions"
            >
              <MoreHorizontal className="w-3.5 h-3.5" />
            </motion.button>

            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  transition={{ duration: 0.12, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute right-0 top-full mt-1 z-50 min-w-40 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-xl overflow-hidden"
                >
                  <ul className="py-1.5">
                    <li>
                      <button
                        type="button"
                        onMouseDown={handleViewDetails}
                        className="w-full flex items-center gap-2.5 px-3 py-2 mx-0 text-sm font-medium text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors duration-100"
                      >
                        <Eye className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
                        View Details
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        onMouseDown={handleEdit}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors duration-100"
                      >
                        <Pencil className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
                        Edit
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        onMouseDown={handleDelete}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors duration-100"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </li>
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div>
          <h3
            className="line-clamp-1 text-[13.5px] font-semibold text-gray-900 dark:text-gray-100 leading-snug tracking-tight cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-150"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/todo/${todo.id}`);
            }}
          >
            {todo.title}
          </h3>
          {todo.description && (
            <p className="mt-1 text-[12px] text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
              {todo.description}
            </p>
          )}
        </div>

        {todo.tags?.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <Tag className="w-3 h-3 text-gray-300 dark:text-gray-600 shrink-0" />
            {todo.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-1.5 py-0.5 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 rounded text-[10px] font-medium text-gray-600 dark:text-gray-400 leading-none"
              >
                {tag}
              </span>
            ))}
            {todo.tags.length > 3 && (
              <span className="text-[10px] text-gray-400 dark:text-gray-500">
                +{todo.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex">
        {startDate && (
          <div className="px-4 py-2 border-t flex items-center gap-1.5 rounded-b-xl">
            <CalendarDays className="w-3 h-3 shrink-0" />
            <span className="text-[10.5px] font-medium leading-none">
              Start {startDate}
            </span>
          </div>
        )}
        {dueDate && (
          <div
            className={`px-4 py-2 border-t flex items-center gap-1.5 rounded-b-xl ${overdue ? "bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30" : "bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800"}`}
          >
            {overdue ? (
              <AlertCircle className="w-3 h-3 text-red-500 shrink-0" />
            ) : (
              <CalendarDays className="w-3 h-3 text-gray-400 dark:text-gray-500 shrink-0" />
            )}
            <span
              className={`text-[10.5px] font-medium leading-none ${overdue ? "text-red-600 dark:text-red-400" : "text-gray-500 dark:text-gray-400"}`}
            >
              {overdue ? "Overdue · " : "Due "}
              {dueDate}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
