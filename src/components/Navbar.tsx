import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  X,
  LogOut,
  Sun,
  Moon,
  SlidersHorizontal,
  Tag,
  CheckSquare,
} from "lucide-react";

import { ActionMenu } from "../ui/Action.menu.ui";
import { Tooltip } from "../ui/Tooltip.ui";
import { useTheme } from "../context/Theme.context";
import type { TodoStats, TodoFilterRequest, Priority } from "../types/index";

interface NavbarProps {
  user?: { name?: string; email?: string } | null;
  stats: TodoStats | null;
  statsLoading: boolean;
  filter: TodoFilterRequest;
  tags: string[];
  onFilterChange: (f: Partial<TodoFilterRequest>) => void;
  onNewTask: () => void;
  onLogout: () => void;
}

const PRIORITIES: Priority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];

const PRIORITY_LABELS: Record<Priority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
};

const PRIORITY_DOT: Record<Priority, string> = {
  LOW: "bg-green-500",
  MEDIUM: "bg-yellow-400",
  HIGH: "bg-orange-500",
  URGENT: "bg-red-500",
};

interface StatPillProps {
  label: string;
  value: number | string;
  dot: string;
  textColor: string;
  index: number;
  loading: boolean;
}

function StatPill({
  label,
  value,
  dot,
  textColor,
  index,
  loading,
}: StatPillProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.2, ease: "easeOut" }}
      className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 cursor-default select-none"
    >
      <span className={`w-2 h-2 rounded-full shrink-0 ${dot}`} />
      <span className={`text-xs font-semibold tabular-nums ${textColor}`}>
        {loading ? "–" : value}
      </span>
      <span className="text-xs text-gray-400 dark:text-gray-500 hidden xl:inline">
        {label}
      </span>
    </motion.div>
  );
}

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <ActionMenu>
      <ActionMenu.Button
        leadingIcon={
          <motion.span
            key={theme}
            initial={{ rotate: -30, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            {theme === "light" ? <Sun size={14} /> : <Moon size={14} />}
          </motion.span>
        }
        size="md"
        variant="default"
        aria-label="Toggle theme"
      >
        <span className="hidden sm:inline">
          {theme === "light" ? "Light" : "Dark"}
        </span>
      </ActionMenu.Button>

      <ActionMenu.Overlay minWidth={140} maxWidth={160}>
        <ActionMenu.List>
          <ActionMenu.Item
            leadingIcon={<Sun size={14} />}
            selected={theme === "light"}
            selectionVariant="single"
            onSelect={() => {
              if (theme !== "light") toggleTheme();
            }}
          >
            Light
          </ActionMenu.Item>
          <ActionMenu.Item
            leadingIcon={<Moon size={14} />}
            selected={theme === "dark"}
            selectionVariant="single"
            onSelect={() => {
              if (theme !== "dark") toggleTheme();
            }}
          >
            Dark
          </ActionMenu.Item>
        </ActionMenu.List>
      </ActionMenu.Overlay>
    </ActionMenu>
  );
}

interface PriorityFilterProps {
  value: Priority | undefined;
  onChange: (p: Priority | undefined) => void;
}

function PriorityFilter({ value, onChange }: PriorityFilterProps) {
  return (
    <ActionMenu>
      <ActionMenu.Button
        leadingIcon={<SlidersHorizontal size={13} />}
        size="md"
        variant="default"
        className={
          value
            ? "text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-700"
            : ""
        }
      >
        {value ? PRIORITY_LABELS[value] : "Priority"}
      </ActionMenu.Button>

      <ActionMenu.Overlay minWidth={160} maxWidth={200}>
        <ActionMenu.List>
          <ActionMenu.Item
            selected={!value}
            selectionVariant="single"
            onSelect={() => onChange(undefined)}
          >
            All priorities
          </ActionMenu.Item>
          <ActionMenu.Divider />
          {PRIORITIES.map((p) => (
            <ActionMenu.Item
              key={p}
              selected={value === p}
              selectionVariant="single"
              leadingIcon={
                <span className={`w-2 h-2 rounded-full ${PRIORITY_DOT[p]}`} />
              }
              onSelect={() => onChange(p)}
            >
              {PRIORITY_LABELS[p]}
            </ActionMenu.Item>
          ))}
        </ActionMenu.List>
      </ActionMenu.Overlay>
    </ActionMenu>
  );
}

interface TagFilterProps {
  value: string | undefined;
  tags: string[];
  onChange: (t: string | undefined) => void;
}

function TagFilter({ value, tags, onChange }: TagFilterProps) {
  if (tags.length === 0) return null;

  return (
    <ActionMenu>
      <ActionMenu.Button
        leadingIcon={<Tag size={13} />}
        size="sm"
        variant="default"
        className={
          value
            ? "text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-700"
            : ""
        }
      >
        {value ? `#${value}` : "Tag"}
      </ActionMenu.Button>

      <ActionMenu.Overlay minWidth={160} maxWidth={220}>
        <ActionMenu.List search searchPlaceholder="Find tag…">
          <ActionMenu.Item
            selected={!value}
            selectionVariant="single"
            onSelect={() => onChange(undefined)}
          >
            All tags
          </ActionMenu.Item>
          <ActionMenu.Divider />
          {tags.map((t) => (
            <ActionMenu.Item
              key={t}
              selected={value === t}
              selectionVariant="single"
              onSelect={() => onChange(t)}
            >
              #{t}
            </ActionMenu.Item>
          ))}
        </ActionMenu.List>
      </ActionMenu.Overlay>
    </ActionMenu>
  );
}

interface ProfileMenuProps {
  user?: { name?: string; email?: string } | null;
  onLogout: () => void;
}

function ProfileMenu({ user, onLogout }: ProfileMenuProps) {
  const initials = (user?.name || user?.email || "U").charAt(0).toUpperCase();

  return (
    <ActionMenu>
      <ActionMenu.Anchor>
        <motion.button
          whileTap={{ scale: 0.92 }}
          className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-200 text-xs font-semibold hover:ring-2 hover:ring-gray-300 dark:hover:ring-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white transition-all"
          aria-label="Profile menu"
        >
          {initials}
        </motion.button>
      </ActionMenu.Anchor>

      <ActionMenu.Overlay minWidth={200} maxWidth={240}>
        <ActionMenu.Header>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-200 text-xs font-bold shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                {user?.name || "–"}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 truncate font-normal">
                {user?.email || "–"}
              </p>
            </div>
          </div>
        </ActionMenu.Header>

        <ActionMenu.List>
          <ActionMenu.Item
            variant="danger"
            leadingIcon={<LogOut size={14} />}
            onSelect={onLogout}
          >
            Sign out
          </ActionMenu.Item>
        </ActionMenu.List>
      </ActionMenu.Overlay>
    </ActionMenu>
  );
}

interface MobileFiltersProps {
  filter: TodoFilterRequest;
  tags: string[];
  onFilterChange: (f: Partial<TodoFilterRequest>) => void;
  stats: TodoStats | null;
  statsLoading: boolean;
}

function MobileFilters({
  filter,
  tags,
  onFilterChange,
  stats,
  statsLoading,
}: MobileFiltersProps) {
  const hasFilters = filter.search || filter.priority || filter.tag;

  const statItems = [
    {
      label: "Total",
      value: stats?.total ?? 0,
      dot: "bg-gray-400",
      textColor: "text-gray-600 dark:text-gray-300",
    },
    {
      label: "Pending",
      value: stats?.pending ?? 0,
      dot: "bg-yellow-400",
      textColor: "text-yellow-700 dark:text-yellow-400",
    },
    {
      label: "In Progress",
      value: stats?.inProgress ?? 0,
      dot: "bg-blue-500",
      textColor: "text-blue-700 dark:text-blue-400",
    },
    {
      label: "Done",
      value: stats?.completed ?? 0,
      dot: "bg-green-500",
      textColor: "text-green-700 dark:text-green-400",
    },
    {
      label: "Cancelled",
      value: stats?.cancelled ?? 0,
      dot: "bg-red-400",
      textColor: "text-red-700 dark:text-red-400",
    },
  ];

  return (
    <div className="px-4 py-3 flex flex-col gap-3 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
      <div className="relative">
        <Search
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none"
          size={14}
        />
        <input
          type="text"
          placeholder="Search tasks…"
          value={filter.search || ""}
          onChange={(e) =>
            onFilterChange({ search: e.target.value || undefined })
          }
          className="w-full h-9 pl-8 pr-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent transition-all"
          aria-label="Search tasks"
        />
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <PriorityFilter
          value={filter.priority}
          onChange={(p) => onFilterChange({ priority: p })}
        />
        <TagFilter
          value={filter.tag}
          tags={tags}
          onChange={(t) => onFilterChange({ tag: t })}
        />

        <AnimatePresence>
          {hasFilters && (
            <motion.button
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.88 }}
              transition={{ duration: 0.14 }}
              onClick={() =>
                onFilterChange({
                  search: undefined,
                  priority: undefined,
                  tag: undefined,
                })
              }
              className="inline-flex items-center gap-1 h-8.5 px-2.5 text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
            >
              <X size={11} />
              Clear
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        {statItems.map((s, i) => (
          <StatPill key={s.label} {...s} index={i} loading={statsLoading} />
        ))}
      </div>
    </div>
  );
}

export default function Navbar({
  user,
  stats,
  statsLoading,
  filter,
  tags,
  onFilterChange,
  onNewTask,
  onLogout,
}: NavbarProps) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const hasFilters = filter.search || filter.priority || filter.tag;

  const statItems = [
    {
      label: "Total",
      value: stats?.total ?? 0,
      dot: "bg-gray-400",
      textColor: "text-gray-600 dark:text-gray-300",
    },
    {
      label: "Pending",
      value: stats?.pending ?? 0,
      dot: "bg-yellow-400",
      textColor: "text-yellow-700 dark:text-yellow-400",
    },
    {
      label: "In Progress",
      value: stats?.inProgress ?? 0,
      dot: "bg-blue-500",
      textColor: "text-blue-700 dark:text-blue-400",
    },
    {
      label: "Done",
      value: stats?.completed ?? 0,
      dot: "bg-green-500",
      textColor: "text-green-700 dark:text-green-400",
    },
    {
      label: "Cancelled",
      value: stats?.cancelled ?? 0,
      dot: "bg-red-400",
      textColor: "text-red-700 dark:text-red-400",
    },
  ];

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
      <div className="px-4 md:px-6 h-14 flex items-center justify-between gap-3">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="flex items-center gap-4 shrink-0 mr-1"
        >
          <div className="w-7 h-7 rounded-md bg-gray-900 dark:bg-white flex items-center justify-center shadow-sm">
            <CheckSquare size={14} className="text-white dark:text-gray-900" />
          </div>
          <span className="font-bold text-gray-900 dark:text-white text-lg tracking-tight hidden sm:inline">
            T O D O
          </span>
        </motion.div>

        <div className="hidden lg:flex items-center gap-3 shrink-0">
          {statItems.map((s, i) => (
            <StatPill key={s.label} {...s} index={i} loading={statsLoading} />
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2 flex-1 max-w-125 min-w-125">
          <div className="relative flex-1 min-w-0">
            <Search
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none"
              size={14}
            />
            <input
              type="text"
              placeholder="Search tasks…"
              value={filter.search || ""}
              onChange={(e) =>
                onFilterChange({ search: e.target.value || undefined })
              }
              className="w-full h-8 pl-8 pr-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent hover:border-gray-300 dark:hover:border-gray-600 transition-all"
              aria-label="Search tasks"
            />
          </div>

          <PriorityFilter
            value={filter.priority}
            onChange={(p) => onFilterChange({ priority: p })}
          />

          <TagFilter
            value={filter.tag}
            tags={tags}
            onChange={(t) => onFilterChange({ tag: t })}
          />

          <AnimatePresence>
            {hasFilters && (
              <motion.button
                initial={{ opacity: 0, scale: 0.85, width: 0 }}
                animate={{ opacity: 1, scale: 1, width: "auto" }}
                exit={{ opacity: 0, scale: 0.85, width: 0 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                onClick={() =>
                  onFilterChange({
                    search: undefined,
                    priority: undefined,
                    tag: undefined,
                  })
                }
                className="inline-flex items-center gap-1 h-7 px-2.5 overflow-hidden whitespace-nowrap text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-750 hover:border-gray-300 dark:hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white transition-colors"
              >
                <X size={11} />
                Clear
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        <div className="flex-1 hidden md:block" />

        <div className="flex items-center gap-2 shrink-0">
          <div className="relative md:hidden">
            <Tooltip content="Filters" position="bottom">
              <motion.button
                whileTap={{ scale: 0.94 }}
                onClick={() => setMobileOpen((p) => !p)}
                aria-label="Toggle filters"
                className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white transition-all"
              >
                <SlidersHorizontal size={15} />
              </motion.button>
            </Tooltip>

            <AnimatePresence>
              {hasFilters && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-white dark:border-gray-900 pointer-events-none"
                />
              )}
            </AnimatePresence>
          </div>

          <ThemeToggle />

          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.1 }}
            onClick={onNewTask}
            className="inline-flex items-center gap-1.5 h-8.5 px-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-semibold rounded-md hover:bg-gray-700 dark:hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:ring-offset-2 transition-colors whitespace-nowrap"
          >
            <Plus size={13} />
            <span className="hidden sm:inline">New task</span>
          </motion.button>

          <Tooltip content="Profile">
            <ProfileMenu user={user} onLogout={onLogout} />
          </Tooltip>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-drawer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
            className="md:hidden"
          >
            <MobileFilters
              filter={filter}
              tags={tags}
              onFilterChange={onFilterChange}
              stats={stats}
              statsLoading={statsLoading}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
