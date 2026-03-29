import React, { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Calendar,
  Clock,
  Tag,
  Link,
  FileText,
  AlignLeft,
  ChevronLeft,
  ChevronRight,
  Check,
  Plus,
  SlidersHorizontal,
  Activity,
} from "lucide-react";

import { ActionMenu } from "../ui/Action.menu.ui";
import type { Todo, TodoRequest, Priority, TodoStatus } from "../types/index";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface TodoFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (req: TodoRequest) => Promise<void>;
  initial?: Todo | null;
  defaultStatus?: TodoStatus;
}

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────
const PRIORITIES: Priority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];
const STATUSES: TodoStatus[] = [
  "PENDING",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
];

const PRIORITY_META: Record<
  Priority,
  { label: string; dot: string; text: string; bg: string; border: string }
> = {
  LOW: {
    label: "Low",
    dot: "bg-green-500",
    text: "text-green-700 dark:text-green-400",
    bg: "bg-green-50 dark:bg-green-500/10",
    border: "border-green-200 dark:border-green-500/30",
  },
  MEDIUM: {
    label: "Medium",
    dot: "bg-yellow-400",
    text: "text-yellow-700 dark:text-yellow-400",
    bg: "bg-yellow-50 dark:bg-yellow-500/10",
    border: "border-yellow-200 dark:border-yellow-500/30",
  },
  HIGH: {
    label: "High",
    dot: "bg-orange-500",
    text: "text-orange-700 dark:text-orange-400",
    bg: "bg-orange-50 dark:bg-orange-500/10",
    border: "border-orange-200 dark:border-orange-500/30",
  },
  URGENT: {
    label: "Urgent",
    dot: "bg-red-500",
    text: "text-red-700 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-500/10",
    border: "border-red-200 dark:border-red-500/30",
  },
};

const STATUS_META: Record<
  TodoStatus,
  { label: string; dot: string; text: string; bg: string; border: string }
> = {
  PENDING: {
    label: "Pending",
    dot: "bg-gray-400",
    text: "text-gray-600 dark:text-gray-400",
    bg: "bg-gray-100 dark:bg-gray-500/10",
    border: "border-gray-200 dark:border-gray-500/30",
  },
  IN_PROGRESS: {
    label: "In Progress",
    dot: "bg-blue-500",
    text: "text-blue-700 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-500/10",
    border: "border-blue-200 dark:border-blue-500/30",
  },
  COMPLETED: {
    label: "Completed",
    dot: "bg-green-500",
    text: "text-green-700 dark:text-green-400",
    bg: "bg-green-50 dark:bg-green-500/10",
    border: "border-green-200 dark:border-green-500/30",
  },
  CANCELLED: {
    label: "Cancelled",
    dot: "bg-red-400",
    text: "text-red-700 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-500/10",
    border: "border-red-200 dark:border-red-500/30",
  },
};

const DAYS_OF_WEEK = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function parseDate(str: string): Date | null {
  if (!str) return null;
  const d = new Date(str + "T00:00:00");
  return isNaN(d.getTime()) ? null : d;
}

function formatDateDisplay(str: string): string {
  const d = parseDate(str);
  if (!d) return "";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function toDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatTimeDisplay(str: string): string {
  if (!str) return "";
  const [h, m] = str.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${ampm}`;
}

// ─────────────────────────────────────────────
// Custom Calendar Component
// ─────────────────────────────────────────────
interface CalendarPickerProps {
  value: string;
  onChange: (val: string) => void;
  minDate?: string;
}

function CalendarPicker({ value, onChange, minDate }: CalendarPickerProps) {
  const today = new Date();
  const selected = parseDate(value);
  const min = parseDate(minDate || "");

  const [viewYear, setViewYear] = useState(
    selected?.getFullYear() ?? today.getFullYear(),
  );
  const [viewMonth, setViewMonth] = useState(
    selected?.getMonth() ?? today.getMonth(),
  );

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else setViewMonth((m) => m + 1);
  };

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.98 }}
      transition={{ duration: 0.16, ease: "easeOut" }}
      className="w-64 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg shadow-black/10 dark:shadow-black/40 p-3 select-none"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2 px-1">
        <button
          type="button"
          onClick={prevMonth}
          className="w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <ChevronLeft size={14} />
        </button>
        <span className="text-xs font-semibold text-gray-900 dark:text-white">
          {MONTHS[viewMonth]} {viewYear}
        </span>
        <button
          type="button"
          onClick={nextMonth}
          className="w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS_OF_WEEK.map((d) => (
          <div
            key={d}
            className="text-center text-[10px] font-semibold text-gray-400 dark:text-gray-500 py-1"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((day, i) => {
          if (day === null) return <div key={`e-${i}`} />;
          const thisDate = new Date(viewYear, viewMonth, day);
          const dateStr = toDateString(thisDate);
          const isSelected = selected && toDateString(selected) === dateStr;
          const isToday = toDateString(today) === dateStr;
          const isDisabled = min ? thisDate < min : false;

          return (
            <button
              key={dateStr}
              type="button"
              disabled={isDisabled}
              onClick={() => onChange(dateStr)}
              className={`
                w-full aspect-square flex items-center justify-center rounded-md text-xs font-medium transition-all
                ${isDisabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}
                ${
                  isSelected
                    ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-sm"
                    : isToday
                      ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-bold ring-1 ring-gray-300 dark:ring-gray-600"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }
              `}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Clear */}
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="mt-2 w-full text-center text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors py-1"
        >
          Clear date
        </button>
      )}
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// Custom Time Picker Component
// ─────────────────────────────────────────────
interface TimePickerProps {
  value: string;
  onChange: (val: string) => void;
}

function TimePicker({ value, onChange }: TimePickerProps) {
  const [hour, setHour] = useState<number>(12);
  const [minute, setMinute] = useState<number>(0);
  const [ampm, setAmpm] = useState<"AM" | "PM">("AM");

  useEffect(() => {
    if (value) {
      const [h, m] = value.split(":").map(Number);
      setAmpm(h >= 12 ? "PM" : "AM");
      setHour(h % 12 || 12);
      setMinute(m);
    }
  }, []);

  const emit = useCallback(
    (h: number, m: number, ap: "AM" | "PM") => {
      let h24 = h % 12;
      if (ap === "PM") h24 += 12;
      onChange(`${String(h24).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    },
    [onChange],
  );

  const setH = (h: number) => {
    setHour(h);
    emit(h, minute, ampm);
  };
  const setM = (m: number) => {
    setMinute(m);
    emit(hour, m, ampm);
  };
  const setAP = (ap: "AM" | "PM") => {
    setAmpm(ap);
    emit(hour, minute, ap);
  };

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

  return (
    <motion.div
      initial={{ opacity: 0, y: -6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.98 }}
      transition={{ duration: 0.16, ease: "easeOut" }}
      className="w-56 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg shadow-black/10 dark:shadow-black/40 p-3 select-none"
    >
      {/* AM/PM Toggle */}
      <div className="flex gap-1.5 mb-3">
        {(["AM", "PM"] as const).map((ap) => (
          <button
            key={ap}
            type="button"
            onClick={() => setAP(ap)}
            className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-all ${
              ampm === ap
                ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            {ap}
          </button>
        ))}
      </div>

      {/* Hours */}
      <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5 px-0.5">
        Hour
      </p>
      <div className="grid grid-cols-6 gap-1 mb-3">
        {hours.map((h) => (
          <button
            key={h}
            type="button"
            onClick={() => setH(h)}
            className={`h-7 rounded-md text-xs font-medium transition-all ${
              hour === h
                ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            {h}
          </button>
        ))}
      </div>

      {/* Minutes */}
      <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5 px-0.5">
        Minute
      </p>
      <div className="grid grid-cols-6 gap-1">
        {minutes.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setM(m)}
            className={`h-7 rounded-md text-xs font-medium transition-all ${
              minute === m
                ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            {String(m).padStart(2, "0")}
          </button>
        ))}
      </div>

      {/* Clear */}
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="mt-2 w-full text-center text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors py-1"
        >
          Clear time
        </button>
      )}
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// Date Field with Popover Calendar
// ─────────────────────────────────────────────
interface DateFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  minDate?: string;
  placeholder?: string;
}

function DateField({
  label,
  value,
  onChange,
  minDate,
  placeholder = "Pick a date",
}: DateFieldProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
        {label}
      </label>
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={`
          w-full h-9 flex items-center gap-2 px-3 rounded-lg border text-sm transition-all text-left
          bg-white dark:bg-gray-800
          ${
            open
              ? "border-gray-400 dark:border-gray-500 ring-1 ring-gray-900 dark:ring-white"
              : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
          }
        `}
      >
        <Calendar
          size={13}
          className="text-gray-400 dark:text-gray-500 shrink-0"
        />
        <span
          className={
            value
              ? "text-gray-900 dark:text-white"
              : "text-gray-400 dark:text-gray-500"
          }
        >
          {value ? formatDateDisplay(value) : placeholder}
        </span>
        {value && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange("");
            }}
            className="ml-auto text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 transition-colors"
          >
            <X size={12} />
          </button>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <div className="absolute z-50 mt-1.5 left-0">
            <CalendarPicker
              value={value}
              onChange={(v) => {
                onChange(v);
                setOpen(false);
              }}
              minDate={minDate}
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────
// Time Field with Popover TimePicker
// ─────────────────────────────────────────────
interface TimeFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

function TimeField({
  label,
  value,
  onChange,
  placeholder = "Pick a time",
}: TimeFieldProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
        {label}
      </label>
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={`
          w-full h-9 flex items-center gap-2 px-3 rounded-lg border text-sm transition-all text-left
          bg-white dark:bg-gray-800
          ${
            open
              ? "border-gray-400 dark:border-gray-500 ring-1 ring-gray-900 dark:ring-white"
              : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
          }
        `}
      >
        <Clock
          size={13}
          className="text-gray-400 dark:text-gray-500 shrink-0"
        />
        <span
          className={
            value
              ? "text-gray-900 dark:text-white"
              : "text-gray-400 dark:text-gray-500"
          }
        >
          {value ? formatTimeDisplay(value) : placeholder}
        </span>
        {value && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange("");
            }}
            className="ml-auto text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 transition-colors"
          >
            <X size={12} />
          </button>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <div className="absolute z-50 mt-1.5 left-0">
            <TimePicker
              value={value}
              onChange={(v) => {
                onChange(v);
              }}
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────
// Section Header
// ─────────────────────────────────────────────
function SectionHeader({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 pt-1">
      <span className="text-gray-300 dark:text-gray-600">{icon}</span>
      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
        {label}
      </span>
      <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Modal
// ─────────────────────────────────────────────
export default function TodoFormModal({
  open,
  onClose,
  onSubmit,
  initial,
  defaultStatus,
}: TodoFormModalProps) {
  const [form, setForm] = useState<TodoRequest>({
    title: "",
    description: "",
    notes: "",
    refLink: "",
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    priority: "MEDIUM",
    status: defaultStatus || "PENDING",
    tags: [],
  });
  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Reset form when modal opens/closes or initial changes
  useEffect(() => {
    if (initial) {
      setForm({
        title: initial.title,
        description: initial.description || "",
        notes: initial.notes || "",
        refLink: initial.refLink || "",
        startDate: initial.startDate || "",
        endDate: initial.endDate || "",
        startTime: initial.startTime || "",
        endTime: initial.endTime || "",
        priority: initial.priority,
        status: initial.status,
        tags: [...initial.tags],
      });
    } else {
      setForm({
        title: "",
        description: "",
        notes: "",
        refLink: "",
        startDate: "",
        endDate: "",
        startTime: "",
        endTime: "",
        priority: "MEDIUM",
        status: defaultStatus || "PENDING",
        tags: [],
      });
    }
    setError("");
    setTagInput("");
  }, [initial, open, defaultStatus]);

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !form.tags.includes(t) && form.tags.length < 10) {
      setForm((f) => ({ ...f, tags: [...f.tags, t] }));
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setForm((f) => ({ ...f, tags: f.tags.filter((x) => x !== tag) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("Title is required");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await onSubmit(form);
      onClose();
    } catch (err: unknown) {
      setError((err as Error).message || "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  // Stagger animation variants for form fields
  const fieldVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.04, duration: 0.22, ease: "easeOut" },
    }),
  };

  const priorityMeta = PRIORITY_META[form.priority];
  const statusMeta = STATUS_META[form.status];

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="
              relative w-full sm:max-w-xl
              bg-white dark:bg-gray-900
              border-0 sm:border border-gray-200 dark:border-gray-800
              rounded-t-2xl sm:rounded-2xl
              shadow-2xl shadow-black/20 dark:shadow-black/60
              overflow-hidden
              max-h-[95dvh] sm:max-h-[90vh]
              flex flex-col
            "
          >
            {/* Mobile drag handle */}
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-8 h-1 rounded-full bg-gray-200 dark:bg-gray-700" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-gray-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <motion.div
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    delay: 0.08,
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                  }}
                  className="w-7 h-7 rounded-md bg-gray-900 dark:bg-white flex items-center justify-center shadow-sm"
                >
                  <Check size={13} className="text-white dark:text-gray-900" />
                </motion.div>
                <h2 className="text-sm font-bold text-gray-900 dark:text-white tracking-tight">
                  {initial ? "Edit task" : "New task"}
                </h2>
              </div>

              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X size={15} />
              </motion.button>
            </div>

            {/* Scrollable body */}
            <form
              onSubmit={handleSubmit}
              className="flex flex-col flex-1 min-h-0"
            >
              <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4 space-y-5">
                {/* ── Title ── */}
                <motion.div
                  custom={0}
                  variants={fieldVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                    Title{" "}
                    <span className="text-red-400 normal-case tracking-normal">
                      *
                    </span>
                  </label>
                  <input
                    autoFocus
                    className="
                      w-full h-10 px-3 rounded-lg border text-sm font-medium
                      bg-white dark:bg-gray-800
                      border-gray-200 dark:border-gray-700
                      text-gray-900 dark:text-white
                      placeholder-gray-400 dark:placeholder-gray-500
                      focus:outline-none focus:ring-1 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent
                      hover:border-gray-300 dark:hover:border-gray-600
                      transition-all
                    "
                    placeholder="What needs to be done?"
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                    maxLength={255}
                  />
                </motion.div>

                {/* ── Description ── */}
                <motion.div
                  custom={1}
                  variants={fieldVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                    Description
                  </label>
                  <textarea
                    className="
                      w-full px-3 py-2.5 rounded-lg border text-sm resize-none
                      bg-white dark:bg-gray-800
                      border-gray-200 dark:border-gray-700
                      text-gray-900 dark:text-white
                      placeholder-gray-400 dark:placeholder-gray-500
                      focus:outline-none focus:ring-1 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent
                      hover:border-gray-300 dark:hover:border-gray-600
                      transition-all
                    "
                    placeholder="Add more context or details…"
                    rows={3}
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                  />
                </motion.div>

                {/* ── Priority & Status ── */}
                <motion.div
                  custom={2}
                  variants={fieldVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <SectionHeader
                    icon={<SlidersHorizontal size={12} />}
                    label="Priority & Status"
                  />
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    {/* Priority ActionMenu */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                        Priority
                      </label>
                      <ActionMenu>
                        <ActionMenu.Button
                          leadingIcon={
                            <span
                              className={`w-2 h-2 rounded-full shrink-0 ${priorityMeta.dot}`}
                            />
                          }
                          size="md"
                          variant="default"
                          className={`w-full justify-start ${priorityMeta.text}`}
                        >
                          {priorityMeta.label}
                        </ActionMenu.Button>
                        <ActionMenu.Overlay minWidth={160} maxWidth={200}>
                          <ActionMenu.List>
                            {PRIORITIES.map((p) => (
                              <ActionMenu.Item
                                key={p}
                                selected={form.priority === p}
                                selectionVariant="single"
                                leadingIcon={
                                  <span
                                    className={`w-2 h-2 rounded-full ${PRIORITY_META[p].dot}`}
                                  />
                                }
                                onSelect={() =>
                                  setForm({ ...form, priority: p })
                                }
                              >
                                {PRIORITY_META[p].label}
                              </ActionMenu.Item>
                            ))}
                          </ActionMenu.List>
                        </ActionMenu.Overlay>
                      </ActionMenu>
                    </div>

                    {/* Status ActionMenu */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                        Status
                      </label>
                      <ActionMenu>
                        <ActionMenu.Button
                          leadingIcon={
                            <span
                              className={`w-2 h-2 rounded-full shrink-0 ${statusMeta.dot}`}
                            />
                          }
                          size="md"
                          variant="default"
                          className={`w-full justify-start ${statusMeta.text}`}
                        >
                          {statusMeta.label}
                        </ActionMenu.Button>
                        <ActionMenu.Overlay minWidth={180} maxWidth={200}>
                          <ActionMenu.List>
                            {STATUSES.map((s) => (
                              <ActionMenu.Item
                                key={s}
                                selected={form.status === s}
                                selectionVariant="single"
                                leadingIcon={
                                  <span
                                    className={`w-2 h-2 rounded-full ${STATUS_META[s].dot}`}
                                  />
                                }
                                onSelect={() => setForm({ ...form, status: s })}
                              >
                                {STATUS_META[s].label}
                              </ActionMenu.Item>
                            ))}
                          </ActionMenu.List>
                        </ActionMenu.Overlay>
                      </ActionMenu>
                    </div>
                  </div>

                  {/* Selected badges */}
                  <div className="flex items-center gap-2 mt-2.5">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${priorityMeta.bg} ${priorityMeta.border} ${priorityMeta.text}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${priorityMeta.dot}`}
                      />
                      {priorityMeta.label}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${statusMeta.bg} ${statusMeta.border} ${statusMeta.text}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${statusMeta.dot}`}
                      />
                      {statusMeta.label}
                    </span>
                  </div>
                </motion.div>

                {/* ── Dates & Times ── */}
                <motion.div
                  custom={3}
                  variants={fieldVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <SectionHeader
                    icon={<Calendar size={12} />}
                    label="Schedule"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                    <DateField
                      label="Start Date"
                      value={form.startDate}
                      onChange={(v) => setForm({ ...form, startDate: v })}
                      placeholder="No start date"
                    />
                    <DateField
                      label="End Date"
                      value={form.endDate}
                      onChange={(v) => setForm({ ...form, endDate: v })}
                      minDate={form.startDate || undefined}
                      placeholder="No end date"
                    />
                    <TimeField
                      label="Start Time"
                      value={form.startTime}
                      onChange={(v) => setForm({ ...form, startTime: v })}
                      placeholder="No start time"
                    />
                    <TimeField
                      label="End Time"
                      value={form.endTime}
                      onChange={(v) => setForm({ ...form, endTime: v })}
                      placeholder="No end time"
                    />
                  </div>
                </motion.div>

                {/* ── Notes ── */}
                <motion.div
                  custom={4}
                  variants={fieldVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <SectionHeader icon={<FileText size={12} />} label="Notes" />
                  <div className="mt-3">
                    <div className="relative">
                      <AlignLeft
                        size={13}
                        className="absolute left-3 top-3 text-gray-400 dark:text-gray-500 pointer-events-none"
                      />
                      <textarea
                        className="
                          w-full pl-8 pr-3 py-2.5 rounded-lg border text-sm resize-none
                          bg-white dark:bg-gray-800
                          border-gray-200 dark:border-gray-700
                          text-gray-900 dark:text-white
                          placeholder-gray-400 dark:placeholder-gray-500
                          focus:outline-none focus:ring-1 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent
                          hover:border-gray-300 dark:hover:border-gray-600
                          transition-all
                        "
                        placeholder="Internal notes, reminders…"
                        rows={2}
                        value={form.notes}
                        onChange={(e) =>
                          setForm({ ...form, notes: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </motion.div>

                {/* ── Reference Link ── */}
                <motion.div
                  custom={5}
                  variants={fieldVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <SectionHeader icon={<Link size={12} />} label="Reference" />
                  <div className="mt-3 relative">
                    <Link
                      size={13}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none"
                    />
                    <input
                      type="url"
                      className="
                        w-full h-9 pl-8 pr-3 rounded-lg border text-sm
                        bg-white dark:bg-gray-800
                        border-gray-200 dark:border-gray-700
                        text-gray-900 dark:text-white
                        placeholder-gray-400 dark:placeholder-gray-500
                        focus:outline-none focus:ring-1 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent
                        hover:border-gray-300 dark:hover:border-gray-600
                        transition-all
                      "
                      placeholder="https://…"
                      value={form.refLink}
                      onChange={(e) =>
                        setForm({ ...form, refLink: e.target.value })
                      }
                    />
                  </div>
                </motion.div>

                {/* ── Tags ── */}
                <motion.div
                  custom={6}
                  variants={fieldVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <SectionHeader icon={<Tag size={12} />} label="Tags" />
                  <div className="mt-3">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag
                          size={13}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none"
                        />
                        <input
                          className="
                            w-full h-9 pl-8 pr-3 rounded-lg border text-sm
                            bg-white dark:bg-gray-800
                            border-gray-200 dark:border-gray-700
                            text-gray-900 dark:text-white
                            placeholder-gray-400 dark:placeholder-gray-500
                            focus:outline-none focus:ring-1 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent
                            hover:border-gray-300 dark:hover:border-gray-600
                            transition-all
                          "
                          placeholder="Add a tag…"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addTag();
                            }
                          }}
                        />
                      </div>
                      <motion.button
                        type="button"
                        whileTap={{ scale: 0.94 }}
                        onClick={addTag}
                        className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-750 hover:text-gray-900 dark:hover:text-white transition-all"
                      >
                        <Plus size={14} />
                      </motion.button>
                    </div>

                    <AnimatePresence>
                      {form.tags.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="flex flex-wrap gap-1.5 mt-2.5 overflow-hidden"
                        >
                          {form.tags.map((tag) => (
                            <motion.span
                              key={tag}
                              layout
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              transition={{ duration: 0.14 }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium"
                            >
                              <span className="text-gray-400 dark:text-gray-500">
                                #
                              </span>
                              {tag}
                              <button
                                type="button"
                                onClick={() => removeTag(tag)}
                                className="ml-0.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors leading-none"
                              >
                                <X size={10} />
                              </button>
                            </motion.span>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>

                {/* ── Error ── */}
                <AnimatePresence>
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="text-red-600 dark:text-red-400 text-xs bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-lg px-3 py-2"
                    >
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* ── Footer ── */}
              <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900 shrink-0">
                {/* Activity indicator badge */}
                <div
                  className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${statusMeta.bg} ${statusMeta.border} ${statusMeta.text}`}
                >
                  <Activity size={11} />
                  {statusMeta.label}
                </div>

                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={onClose}
                    className="h-8.5 px-3.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
                  >
                    Cancel
                  </button>
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileTap={{ scale: 0.97 }}
                    whileHover={{ scale: 1.01 }}
                    transition={{ duration: 0.1 }}
                    className="
                      inline-flex items-center gap-1.5 h-8.5 px-4
                      bg-gray-900 dark:bg-white
                      text-white dark:text-gray-900
                      text-sm font-semibold rounded-lg
                      hover:bg-gray-700 dark:hover:bg-gray-100
                      focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:ring-offset-2
                      disabled:opacity-50 disabled:cursor-not-allowed
                      transition-all shadow-sm
                    "
                  >
                    {loading ? (
                      <>
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{
                            repeat: Infinity,
                            duration: 0.8,
                            ease: "linear",
                          }}
                          className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full"
                        />
                        Saving…
                      </>
                    ) : (
                      <>
                        <Check size={13} />
                        {initial ? "Save changes" : "Create task"}
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
