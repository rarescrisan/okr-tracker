'use client';

import { useState } from 'react';

interface CompletionModalProps {
  taskTitle: string;
  onConfirm: (completionLink: string, completionNote: string) => void;
  onCancel: () => void;
}

export function CompletionModal({ taskTitle, onConfirm, onCancel }: CompletionModalProps) {
  const [link, setLink] = useState('');
  const [note, setNote] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(link.trim(), note.trim());
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/50" onClick={onCancel} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#151929] border border-white/[0.10] rounded-xl shadow-2xl">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 p-6 pb-4 border-b border-white/[0.06]">
            <div>
              <h2 className="text-base font-semibold text-white">Mark task as complete</h2>
              <p className="text-sm text-[#A0A8C8] mt-0.5 line-clamp-1">{taskTitle}</p>
            </div>
            <button
              onClick={onCancel}
              className="p-1.5 text-[#A0A8C8] hover:text-white hover:bg-white/[0.08] rounded transition-colors flex-shrink-0"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#A0A8C8] mb-1.5">
                Work link <span className="text-[#6B7394] font-normal">(optional)</span>
              </label>
              <input
                type="url"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 text-sm bg-white/[0.06] border border-white/[0.12] rounded-lg text-white placeholder-[#6B7394] focus:outline-none focus:border-[#4573d2] focus:bg-white/[0.08] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#A0A8C8] mb-1.5">
                Completion note <span className="text-[#6B7394] font-normal">(optional)</span>
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Describe what was done..."
                rows={3}
                className="w-full px-3 py-2 text-sm bg-white/[0.06] border border-white/[0.12] rounded-lg text-white placeholder-[#6B7394] focus:outline-none focus:border-[#4573d2] focus:bg-white/[0.08] transition-colors resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-1">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium text-[#A0A8C8] hover:text-white bg-white/[0.06] hover:bg-white/[0.10] rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-[#2DD4A8] hover:bg-[#25B890] rounded-lg transition-colors"
              >
                Mark complete
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
