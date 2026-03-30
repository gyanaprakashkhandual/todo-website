/* eslint-disable no-empty-pattern */
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  CheckSquare,
  ArrowRight,
  CheckCheck,
  Zap,
  Shield,
  Kanban,
  Tag,
  CalendarDays,
  MoreHorizontal,
  Globe,
  Bird,
} from "lucide-react";
import { Tooltip } from "../../ui/Tooltip.ui";

function GithubIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

const FEATURES = [
  {
    icon: <CheckCheck className="w-4 h-4" />,
    title: "Track everything",
    desc: "Create, complete, and organize tasks with full priority and tag support.",
  },
  {
    icon: <Zap className="w-4 h-4" />,
    title: "Instant sync",
    desc: "Your todos persist in the cloud, always up to date across devices.",
  },
  {
    icon: <Shield className="w-4 h-4" />,
    title: "Secure by default",
    desc: "OAuth2 sign-in with Google or GitHub — no passwords to remember.",
  },
];

function GridPattern() {
  return (
    <svg
      className="absolute inset-0 w-full h-full opacity-[0.035] dark:opacity-[0.055] pointer-events-none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path
            d="M 40 0 L 0 0 0 40"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>
  );
}

// ── Mini Kanban card ─────────────────────────────────────────────────────────
interface MiniCardProps {
  title: string;
  tag: string;
  tagColor: string;
  priority: string;
  priorityColor: string;
  date?: string;
  syncing?: boolean;
  accent: string;
}

function MiniCard({
  title,
  tag,
  tagColor,
  priority,
  priorityColor,
  date,
  syncing,
  accent,
}: MiniCardProps) {
  return (
    <div className="relative bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
      <span
        className="absolute left-0 top-3 bottom-3 w-0.75 rounded-r-full"
        style={{ background: accent }}
      />
      {syncing && (
        <div className="absolute inset-0 bg-white/60 dark:bg-gray-900/60 rounded-xl flex items-center justify-center z-10">
          <div className="w-3.5 h-3.5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <div className="px-3.5 pt-3 pb-0 pl-5">
        <div className="flex items-center gap-1.5 mb-2">
          <span
            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold border ${tagColor}`}
          >
            <span
              className="w-1 h-1 rounded-full"
              style={{ background: accent }}
            />
            {tag}
          </span>
          <span
            className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold border ${priorityColor}`}
          >
            {priority}
          </span>
          <MoreHorizontal className="w-3 h-3 text-gray-300 dark:text-gray-600 ml-auto" />
        </div>
        <p className="text-[11px] font-medium text-gray-800 dark:text-gray-200 leading-snug mb-2 line-clamp-2">
          {title}
        </p>
        {date && (
          <div className="flex items-center gap-1 pb-2.5">
            <Tag className="w-2.5 h-2.5 text-gray-300 dark:text-gray-600" />
            <span className="text-[9px] text-gray-400 dark:text-gray-600">
              design-system
            </span>
          </div>
        )}
      </div>
      {date && (
        <div className="flex items-center gap-1.5 px-3.5 pl-5 py-2 border-t border-gray-50 dark:border-gray-800/80 bg-gray-50/60 dark:bg-gray-800/30">
          <CalendarDays className="w-2.5 h-2.5 text-gray-400" />
          <span className="text-[9px] text-gray-400">{date}</span>
        </div>
      )}
    </div>
  );
}

// ── Mini Kanban board preview ────────────────────────────────────────────────
function KanbanPreview() {
  const cols = [
    {
      id: "PENDING",
      label: "Pending",
      color: "#94a3b8",
      countBg: "bg-slate-100 dark:bg-slate-800/60 text-slate-500",
      cards: [
        {
          title: "Set up Playwright E2E test suite and CI integration",
          tag: "Pending",
          tagColor:
            "bg-slate-50 dark:bg-slate-800/50 text-slate-500 border-slate-200 dark:border-slate-700",
          priority: "High",
          priorityColor:
            "bg-orange-50 dark:bg-orange-900/20 text-orange-600 border-orange-200 dark:border-orange-800/40",
          date: "Due Apr 18",
          accent: "#ea580c",
        },
        {
          title: "Audit unused npm dependencies",
          tag: "Pending",
          tagColor:
            "bg-slate-50 dark:bg-slate-800/50 text-slate-500 border-slate-200 dark:border-slate-700",
          priority: "Low",
          priorityColor:
            "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 border-indigo-200 dark:border-indigo-800/40",
          accent: "#6366f1",
        },
      ],
    },
    {
      id: "IN_PROGRESS",
      label: "In Progress",
      color: "#3b82f6",
      countBg: "bg-blue-50 dark:bg-blue-900/20 text-blue-600",
      cards: [
        {
          title: "Redesign authentication flow for mobile users",
          tag: "In Progress",
          tagColor:
            "bg-blue-50 dark:bg-blue-900/20 text-blue-600 border-blue-200 dark:border-blue-800/40",
          priority: "Urgent",
          priorityColor:
            "bg-red-50 dark:bg-red-900/20 text-red-600 border-red-200 dark:border-red-800/40",
          date: "Overdue · Mar 25",
          accent: "#ef4444",
          syncing: true,
        },
        {
          title: "Write API documentation for v2 endpoints",
          tag: "In Progress",
          tagColor:
            "bg-blue-50 dark:bg-blue-900/20 text-blue-600 border-blue-200 dark:border-blue-800/40",
          priority: "Medium",
          priorityColor:
            "bg-amber-50 dark:bg-amber-900/20 text-amber-600 border-amber-200 dark:border-amber-800/40",
          date: "Due Apr 5",
          accent: "#f59e0b",
        },
      ],
    },
    {
      id: "COMPLETED",
      label: "Completed",
      color: "#22c55e",
      countBg: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600",
      cards: [
        {
          title: "Fix payment gateway timeout errors in production",
          tag: "Completed",
          tagColor:
            "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 border-emerald-200 dark:border-emerald-800/40",
          priority: "High",
          priorityColor:
            "bg-orange-50 dark:bg-orange-900/20 text-orange-600 border-orange-200 dark:border-orange-800/40",
          accent: "#22c55e",
        },
      ],
    },
  ];

  return (
    <div className="w-full overflow-x-auto pb-2 select-none">
      <div className="flex gap-3 min-w-170">
        {cols.map((col) => (
          <div key={col.id} className="flex-1 min-w-50">
            <div className="flex items-center gap-2 px-2.5 py-2 mb-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ background: col.color }}
              />
              <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-300 flex-1 truncate">
                {col.label}
              </span>
              <span
                className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${col.countBg}`}
              >
                {col.cards.length}
              </span>
            </div>
            <div className="space-y-2 bg-gray-50/70 dark:bg-gray-800/30 rounded-xl p-1.5 border-2 border-transparent">
              {col.cards.map((card, i) => (
                <MiniCard key={i} {...card} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface HeroPageProps {
  onGetStarted: () => void;
}
export default function HeroPage({}: HeroPageProps) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);

  const handleSignIn = () => {
    navigate("/sign-in");
  };

  return (
    <div className="relative min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white overflow-x-hidden flex flex-col">
      <GridPattern />

      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-150 h-90 bg-gray-100 dark:bg-gray-800/60 rounded-full blur-3xl opacity-40 dark:opacity-20 pointer-events-none" />

      {/* ── Navbar ── */}
      <nav className="relative z-10 flex items-center justify-between px-5 sm:px-8 md:px-12 py-4 border-b border-gray-100 dark:border-gray-800/60">
        <motion.div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gray-900 dark:bg-white rounded-lg flex items-center justify-center shrink-0">
            <CheckSquare className="w-3.5 h-3.5 text-white dark:text-gray-900" />
          </div>
          <span className="font-semibold text-base tracking-tight">Todo</span>
        </motion.div>

        <motion.div className="flex items-center gap-2 sm:gap-3">
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={handleSignIn}
            className="px-4 py-2 text-sm font-medium bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-100 transition-colors"
          >
            Sign in
          </motion.button>
        </motion.div>
      </nav>

      <main className="relative z-10 flex-1 flex flex-col items-center px-5 sm:px-8 md:px-12 pt-14 pb-20 sm:pt-20">
        <div className="w-full max-w-5xl flex flex-col items-center text-center">
          {/* Badge */}
          <motion.div>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 mb-8 bg-white dark:bg-gray-900">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Available on mobile &amp; desktop
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight leading-[1.06] max-w-3xl"
            style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
          >
            Every task,
            <br />
            <span className="italic font-normal text-gray-400 dark:text-gray-600">
              perfectly
            </span>{" "}
            placed.
          </motion.h1>

          <motion.p className="mt-6 text-base sm:text-lg text-gray-500 dark:text-gray-400 max-w-md leading-relaxed">
            A focused todo manager with Kanban boards, smart filters, and a
            clean UI built for how you actually work.
          </motion.p>

          {/* CTAs */}
          <motion.div className="mt-9 flex flex-col sm:flex-row items-center gap-3">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onHoverStart={() => setHovered(true)}
              onHoverEnd={() => setHovered(false)}
              onClick={handleSignIn}
              className="flex items-center gap-2 px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-semibold rounded-xl hover:bg-gray-700 dark:hover:bg-gray-100 transition-colors"
            >
              Get started free
              <motion.span
                animate={{ x: hovered ? 4 : 0 }}
                transition={{ duration: 0.18 }}
              >
                <ArrowRight className="w-4 h-4" />
              </motion.span>
            </motion.button>
            <button
              onClick={handleSignIn}
              className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors px-2"
            >
              Sign in instead →
            </button>
          </motion.div>

          {/* ── Kanban screenshot mockup ── */}
          <motion.div className="mt-16 w-full">
            <div className="relative w-full rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/60 overflow-hidden shadow-xl shadow-gray-100 dark:shadow-none">
              {/* Fake browser bar */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
                <div className="flex-1 mx-4 h-6 bg-gray-100 dark:bg-gray-800 rounded-md flex items-center px-3">
                  <span className="text-[10px] text-gray-400 dark:text-gray-600">
                    app.todo.com/kanban
                  </span>
                </div>
              </div>

              {/* Kanban content */}
              <div className="p-4 sm:p-6">
                {/* Toolbar row */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Kanban className="w-4 h-4 text-gray-400" />
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                      Kanban Board
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-6 px-3 bg-gray-900 dark:bg-white rounded-md flex items-center">
                      <span className="text-[10px] font-semibold text-white dark:text-gray-900">
                        + New task
                      </span>
                    </div>
                  </div>
                </div>

                <KanbanPreview />
              </div>
            </div>
          </motion.div>

          {/* ── Feature cards ── */}
          <motion.div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.45,
                  delay: 0.58 + i * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="text-left p-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-200 dark:hover:border-gray-700 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 mb-3">
                  {f.icon}
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                  {f.title}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 leading-relaxed">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-gray-100 dark:border-gray-800/60 px-5 sm:px-8 md:px-12 py-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-900 dark:bg-white rounded-md flex items-center justify-center shrink-0">
              <CheckSquare className="w-3 h-3 text-white dark:text-gray-900" />
            </div>
            <span className="text-sm font-semibold text-gray-900 dark:text-white tracking-tight">
              Todo
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-600 ml-1">
              © {new Date().getFullYear()} Made by Gyanaprakash Khandual
            </span>
          </div>

          <div className="flex items-center gap-5 text-xs text-gray-400 dark:text-gray-600">
            <a
              href="privacy-policy"
              className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              Privacy
            </a>
            <a
              href="/terms-and-conditions"
              className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              Terms
            </a>
            <a
              href="https://gyanprakash.vercel.app/support"
              target="_blank"
              className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              Support
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Tooltip content="Follow me On Github">
              <a
                href="/https://github.com/gyanaprakashkhandual"
                target="_blank"
                className="w-7 h-7 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-400 dark:text-gray-600 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
              >
                <GithubIcon />
              </a>
            </Tooltip>
            <Tooltip content="Follow me On Twitter">
              <a
                href="https://twitter.com/gyanaprakashkhandual"
                target="_blank"
                className="w-7 h-7 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-400 dark:text-gray-600 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
              >
                <Bird className="w-3.5 h-3.5" />
              </a>
            </Tooltip>
            <Tooltip content="Visit my Portfolio">
              <a
                href="https://gyanprakash.verce.app"
                target="_blank"
                className="w-7 h-7 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-400 dark:text-gray-600 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
              >
                <Globe className="w-3.5 h-3.5" />
              </a>
            </Tooltip>
          </div>
        </div>
      </footer>
    </div>
  );
}
