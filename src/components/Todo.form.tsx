import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Todo, TodoRequest, Priority, TodoStatus } from '../types/index';

interface TodoFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (req: TodoRequest) => Promise<void>;
  initial?: Todo | null;
  defaultStatus?: TodoStatus;
}

const PRIORITIES: Priority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
const STATUSES: TodoStatus[] = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

const PRIORITY_COLORS: Record<Priority, string> = {
  LOW: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
  MEDIUM: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
  HIGH: 'text-orange-400 bg-orange-400/10 border-orange-400/30',
  URGENT: 'text-red-400 bg-red-400/10 border-red-400/30',
};

const STATUS_COLORS: Record<TodoStatus, string> = {
  PENDING: 'text-slate-400 bg-slate-400/10 border-slate-400/30',
  IN_PROGRESS: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
  COMPLETED: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
  CANCELLED: 'text-red-400 bg-red-400/10 border-red-400/30',
};

export default function TodoFormModal({ open, onClose, onSubmit, initial, defaultStatus }: TodoFormModalProps) {
  const [form, setForm] = useState<TodoRequest>({
    title: '',
    description: '',
    notes: '',
    refLink: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    priority: 'MEDIUM',
    status: defaultStatus || 'PENDING',
    tags: [],
  });
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initial) {
      setForm({
        title: initial.title,
        description: initial.description || '',
        notes: initial.notes || '',
        refLink: initial.refLink || '',
        startDate: initial.startDate || '',
        endDate: initial.endDate || '',
        startTime: initial.startTime || '',
        endTime: initial.endTime || '',
        priority: initial.priority,
        status: initial.status,
        tags: [...initial.tags],
      });
    } else {
      setForm({
        title: '',
        description: '',
        notes: '',
        refLink: '',
        startDate: '',
        endDate: '',
        startTime: '',
        endTime: '',
        priority: 'MEDIUM',
        status: defaultStatus || 'PENDING',
        tags: [],
      });
    }
    setError('');
    setTagInput('');
  }, [initial, open, defaultStatus]);

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !form.tags.includes(t) && form.tags.length < 10) {
      setForm((f) => ({ ...f, tags: [...f.tags, t] }));
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setForm((f) => ({ ...f, tags: f.tags.filter((x) => x !== tag) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { setError('Title is required'); return; }
    setLoading(true);
    setError('');
    try {
      await onSubmit(form);
      onClose();
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative w-full max-w-xl bg-[#111118] border border-white/10 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
              <h2 className="text-white font-semibold text-base">
                {initial ? 'Edit task' : 'New task'}
              </h2>
              <button
                onClick={onClose}
                className="text-white/30 hover:text-white/70 transition-colors p-1 rounded-lg hover:bg-white/5"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleSubmit}>
              <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto custom-scroll">
                {/* Title */}
                <div>
                  <label className="form-label">Title *</label>
                  <input
                    className="form-input"
                    placeholder="What needs to be done?"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    maxLength={255}
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-input resize-none"
                    placeholder="Add more details..."
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>

                {/* Priority + Status */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="form-label">Priority</label>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {PRIORITIES.map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setForm({ ...form, priority: p })}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                            form.priority === p
                              ? PRIORITY_COLORS[p] + ' ring-1 ring-current'
                              : 'text-white/30 bg-white/5 border-white/10 hover:border-white/20'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Status</label>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {STATUSES.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setForm({ ...form, status: s })}
                          className={`px-2 py-1 rounded-lg text-xs font-semibold border transition-all ${
                            form.status === s
                              ? STATUS_COLORS[s] + ' ring-1 ring-current'
                              : 'text-white/30 bg-white/5 border-white/10 hover:border-white/20'
                          }`}
                        >
                          {s.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="form-label">Start date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={form.startDate}
                      onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="form-label">End date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={form.endDate}
                      onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    />
                  </div>
                </div>

                {/* Times */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="form-label">Start time</label>
                    <input
                      type="time"
                      className="form-input"
                      value={form.startTime}
                      onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="form-label">End time</label>
                    <input
                      type="time"
                      className="form-input"
                      value={form.endTime}
                      onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="form-label">Notes</label>
                  <textarea
                    className="form-input resize-none"
                    placeholder="Internal notes..."
                    rows={2}
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  />
                </div>

                {/* Ref link */}
                <div>
                  <label className="form-label">Reference link</label>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="https://..."
                    value={form.refLink}
                    onChange={(e) => setForm({ ...form, refLink: e.target.value })}
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="form-label">Tags</label>
                  <div className="flex gap-2">
                    <input
                      className="form-input flex-1"
                      placeholder="Add tag…"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="px-3 py-2 bg-white/[0.06] border border-white/10 rounded-xl text-white/50 hover:text-white/80 text-sm transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  {form.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {form.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-2 py-0.5 bg-violet-500/10 border border-violet-500/20 rounded-full text-violet-300 text-xs"
                        >
                          #{tag}
                          <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-400 transition-colors">×</button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {error && (
                  <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm text-white/40 hover:text-white/70 transition-colors rounded-xl hover:bg-white/5"
                >
                  Cancel
                </button>
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileTap={{ scale: 0.97 }}
                  className="px-5 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-violet-500/20 hover:brightness-110 transition-all disabled:opacity-60"
                >
                  {loading ? 'Saving…' : initial ? 'Save changes' : 'Create task'}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}