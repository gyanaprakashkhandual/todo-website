'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckSquare, ArrowRight, CheckCheck, Zap, Shield, Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/Theme.context';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] },
});

const FEATURES = [
  {
    icon: <CheckCheck className="w-4 h-4" />,
    title: 'Track everything',
    desc: 'Create, complete, and delete tasks with a single click.',
  },
  {
    icon: <Zap className="w-4 h-4" />,
    title: 'Instant sync',
    desc: 'Your todos persist in the cloud, always up to date.',
  },
  {
    icon: <Shield className="w-4 h-4" />,
    title: 'Secure by default',
    desc: 'JWT-authenticated, BCrypt-hashed, OAuth2-ready.',
  },
];

// Subtle grid background pattern
function GridPattern() {
  return (
    <svg
      className="absolute inset-0 w-full h-full opacity-[0.035] dark:opacity-[0.06] pointer-events-none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>
  );
}

interface HeroPageProps {
  onGetStarted: () => void;
}

export default function HeroPage({ onGetStarted }: HeroPageProps) {
  const { theme, toggleTheme } = useTheme();
  const [hovered, setHovered] = useState(false);

  return (
    <div className="relative min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white overflow-hidden flex flex-col">
      <GridPattern />

      {/* Soft radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gray-100 dark:bg-gray-800 rounded-full blur-3xl opacity-40 dark:opacity-20 pointer-events-none" />

      {/* ── Navbar ── */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-5 border-b border-gray-100 dark:border-gray-800/60">
        <motion.div
          {...fadeUp(0)}
          className="flex items-center gap-2.5"
        >
          <div className="w-7 h-7 bg-gray-900 dark:bg-white rounded-lg flex items-center justify-center">
            <CheckSquare className="w-4 h-4 text-white dark:text-gray-900" />
          </div>
          <span className="font-semibold text-base tracking-tight">TODO</span>
        </motion.div>

        <motion.div {...fadeUp(0.05)} className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={onGetStarted}
            className="px-4 py-2 text-sm font-medium bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-100 transition-colors"
          >
            Sign in
          </motion.button>
        </motion.div>
      </nav>

      {/* ── Hero ── */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center pt-12 pb-24">

        {/* Badge */}
        <motion.div {...fadeUp(0.1)}>
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 mb-8 bg-white dark:bg-gray-900">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Spring Boot + PostgreSQL backend running
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          {...fadeUp(0.18)}
          className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.05] max-w-3xl"
          style={{ fontFamily: "'DM Serif Display', serif" }}
        >
          Every task,
          <br />
          <span className="italic font-normal text-gray-400 dark:text-gray-600">perfectly</span> placed.
        </motion.h1>

        <motion.p
          {...fadeUp(0.28)}
          className="mt-6 text-base md:text-lg text-gray-500 dark:text-gray-400 max-w-md leading-relaxed"
        >
          TODO is a minimal, secure task manager. Sign in once and your
          tasks follow you everywhere — always in sync, always private.
        </motion.p>

        {/* CTA */}
        <motion.div {...fadeUp(0.36)} className="mt-10 flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onHoverStart={() => setHovered(true)}
            onHoverEnd={() => setHovered(false)}
            onClick={onGetStarted}
            className="group relative flex items-center gap-2 px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-semibold rounded-xl overflow-hidden transition-colors hover:bg-gray-700 dark:hover:bg-gray-100"
          >
            Get started free
            <motion.span
              animate={{ x: hovered ? 4 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ArrowRight className="w-4 h-4" />
            </motion.span>
          </motion.button>

          <button
            onClick={onGetStarted}
            className="px-6 py-3 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Sign in instead →
          </button>
        </motion.div>

        {/* ── Feature cards ── */}
        <motion.div
          {...fadeUp(0.46)}
          className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl w-full"
        >
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.52 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="text-left p-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-200 dark:hover:border-gray-700 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 mb-3">
                {f.icon}
              </div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{f.title}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Social proof */}
        <motion.p
          {...fadeUp(0.72)}
          className="mt-12 text-xs text-gray-300 dark:text-gray-700"
        >
          JWT · BCrypt · OAuth2 Google & GitHub · PostgreSQL · Spring Boot 4
        </motion.p>
      </main>
    </div>
  );
}