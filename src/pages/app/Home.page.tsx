'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckSquare,
  LogOut,
  User
} from 'lucide-react';
import { useAuth } from '../../context/Auth.context';
import ThemeToggle from '../../assets/Theme.toggle';
import KanbanPage from '../../components/kanban/Main';


// ── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user, logout } = useAuth();
  const [showProfile, setShowProfile] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-gray-900 dark:text-white" />
            <span className="font-semibold text-gray-900 dark:text-white tracking-tight">TodoApp</span>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />

            {/* Profile dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProfile((p) => !p)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <User className="w-3.5 h-3.5" />
                <span className="max-w-[100px] truncate">{user?.name || user?.email || 'Account'}</span>
              </button>

              <AnimatePresence>
                {showProfile && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-lg p-1 z-20"
                  >
                    <div className="px-3 py-2.5 border-b border-gray-100 dark:border-gray-700 mb-1">
                      <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                        {user?.name}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{user?.email}</p>
                    </div>
                    <button
                      onClick={() => { setShowProfile(false); logout(); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>
      <KanbanPage/>
    </div>
  );
}
