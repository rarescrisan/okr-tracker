'use client';

import { useState, useRef, useEffect } from 'react';
import { TodoItem } from '@/src/types';

interface TodoListProps {
  items: TodoItem[];
  onAdd: (text: string) => Promise<void>;
  onToggle: (id: number) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export function TodoList({ items, onAdd, onToggle, onDelete }: TodoListProps) {
  const [inputValue, setInputValue] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const active = items.filter((i) => !i.is_completed);
  const completed = items.filter((i) => i.is_completed);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const text = inputValue.trim();
    if (!text || submitting) return;
    setSubmitting(true);
    try {
      await onAdd(text);
      setInputValue('');
      inputRef.current?.focus();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Add input */}
      <form onSubmit={handleAdd} className="flex gap-2 mb-4">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Add a to-do..."
          className="flex-1 h-9 px-3 text-sm border border-white/[0.12] rounded-md bg-[#1A1F36] text-white placeholder-[#6B7394] focus:outline-none focus:ring-2 focus:ring-[#00C8FF] focus:border-transparent"
          disabled={submitting}
        />
        <button
          type="submit"
          disabled={!inputValue.trim() || submitting}
          className="h-9 px-3 text-sm font-medium bg-[#2A3152] text-[#00C8FF] border border-[#00C8FF]/[0.4] rounded-md hover:bg-[#00C8FF]/[0.12] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Add
        </button>
      </form>

      <div className="flex-1 space-y-1 overflow-y-auto">
        {/* Active items */}
        {active.map((item) => (
          <TodoRow key={item.id} item={item} onToggle={onToggle} onDelete={onDelete} />
        ))}

        {active.length === 0 && completed.length === 0 && (
          <p className="text-sm text-[#6B7394] text-center py-6">No to-dos yet.</p>
        )}

        {/* Completed items */}
        {completed.length > 0 && (
          <div className="mt-4 pt-4 border-t border-white/[0.06]">
            <p className="text-xs font-semibold text-[#6B7394] uppercase tracking-wide mb-2">
              Done ({completed.length})
            </p>
            {completed.map((item) => (
              <TodoRow key={item.id} item={item} onToggle={onToggle} onDelete={onDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TodoRow({
  item,
  onToggle,
  onDelete,
}: {
  item: TodoItem;
  onToggle: (id: number) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}) {
  const [toggling, setToggling] = useState(false);

  async function handleToggle() {
    if (toggling) return;
    setToggling(true);
    try { await onToggle(item.id); } finally { setToggling(false); }
  }

  return (
    <div className="group flex items-start gap-2.5 px-2 py-2 rounded-md hover:bg-white/[0.04] transition-colors">
      {/* Checkbox */}
      <button
        onClick={handleToggle}
        disabled={toggling}
        className={`mt-0.5 w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
          item.is_completed
            ? 'bg-[#2DD4A8] border-[#2DD4A8]'
            : 'border-white/[0.25] hover:border-[#2DD4A8] hover:bg-[#2DD4A8]/[0.10]'
        }`}
      >
        {item.is_completed && (
          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      {/* Text */}
      <span
        className={`flex-1 text-sm leading-relaxed break-words min-w-0 ${
          item.is_completed ? 'line-through text-[#6B7394]' : 'text-white'
        }`}
      >
        {item.text}
      </span>

      {/* Delete */}
      <button
        onClick={() => onDelete(item.id)}
        className="opacity-0 group-hover:opacity-100 p-0.5 text-[#6B7394] hover:text-[#FF4D6A] transition-all flex-shrink-0"
        title="Remove"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
