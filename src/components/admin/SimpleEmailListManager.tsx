"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mail, Plus, X, Check, Star } from "lucide-react";

type EmailType = {
  address: string;
  label: string;
  isPrimary: boolean;
};

type SimpleEmailListManagerProps = {
  emails: EmailType[];
  onChange: (emails: EmailType[]) => void;
  disabled?: boolean;
};

const EMAIL_LABELS = ["Personal", "Business", "Work", "Other"];

export default function SimpleEmailListManager({ emails, onChange, disabled }: SimpleEmailListManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newEmail, setNewEmail] = useState({ address: "", label: "Business" });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleAdd = () => {
    if (!newEmail.address.trim()) return;

    const emailToAdd: EmailType = {
      address: newEmail.address.trim(),
      label: newEmail.label,
      isPrimary: emails.length === 0, // First email is automatically primary
    };

    onChange([...emails, emailToAdd]);
    setNewEmail({ address: "", label: "Business" });
    setIsAdding(false);
  };

  const handleUpdate = (index: number, updates: Partial<EmailType>) => {
    const updated = emails.map((email, i) =>
      i === index ? { ...email, ...updates } : email
    );
    onChange(updated);
    setEditingIndex(null);
  };

  const handleRemove = (index: number) => {
    const emailToRemove = emails[index];
    const remaining = emails.filter((_, i) => i !== index);

    // If removing primary email and there are others, make the first one primary
    if (emailToRemove.isPrimary && remaining.length > 0) {
      remaining[0] = { ...remaining[0], isPrimary: true };
    }

    onChange(remaining);
  };

  const handleSetPrimary = (index: number) => {
    const updated = emails.map((email, i) => ({
      ...email,
      isPrimary: i === index,
    }));
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-white flex items-center gap-2">
          <Mail className="w-4 h-4 text-brand-light" />
          Email Addresses
        </label>
        {!isAdding && !disabled && (
          <button
            onClick={() => setIsAdding(true)}
            className="text-xs text-brand-light hover:text-white transition-colors flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />
            Add Email
          </button>
        )}
      </div>

      <AnimatePresence mode="popLayout">
        {emails.map((email, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex items-center gap-2 p-3 rounded-lg bg-white/5 border border-white/10"
          >
            {editingIndex === index ? (
              <>
                <input
                  type="email"
                  value={email.address}
                  onChange={(e) => handleUpdate(index, { address: e.target.value })}
                  className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-brand-light/50"
                  placeholder="email@example.com"
                  autoFocus
                />
                <select
                  value={email.label}
                  onChange={(e) => handleUpdate(index, { label: e.target.value })}
                  className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-brand-light/50"
                >
                  {EMAIL_LABELS.map((label) => (
                    <option key={label} value={label}>
                      {label}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => setEditingIndex(null)}
                  className="p-2 rounded-lg hover:bg-white/10 text-brand-light transition-colors"
                >
                  <Check className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-white text-sm">{email.address}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-brand-light/20 text-brand-light border border-brand-light/30">
                      {email.label}
                    </span>
                    {email.isPrimary && (
                      <span className="text-xs text-yellow-400">Primary</span>
                    )}
                  </div>
                </div>
                {!disabled && (
                  <div className="flex items-center gap-1">
                    {!email.isPrimary && (
                      <button
                        onClick={() => handleSetPrimary(index)}
                        className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-yellow-400 transition-colors"
                        title="Set as primary"
                      >
                        <Star className="w-3 h-3" />
                      </button>
                    )}
                    <button
                      onClick={() => setEditingIndex(index)}
                      className="text-xs text-gray-400 hover:text-white transition-colors px-2"
                    >
                      Edit
                    </button>
                    {emails.length > 1 && (
                      <button
                        onClick={() => handleRemove(index)}
                        className="p-2 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </motion.div>
        ))}

        {isAdding && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 p-3 rounded-lg bg-white/5 border border-brand-light/50"
          >
            <input
              type="email"
              value={newEmail.address}
              onChange={(e) => setNewEmail({ ...newEmail, address: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-brand-light/50"
              placeholder="email@example.com"
              autoFocus
            />
            <select
              value={newEmail.label}
              onChange={(e) => setNewEmail({ ...newEmail, label: e.target.value })}
              className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-brand-light/50"
            >
              {EMAIL_LABELS.map((label) => (
                <option key={label} value={label}>
                  {label}
                </option>
              ))}
            </select>
            <button
              onClick={handleAdd}
              className="p-2 rounded-lg bg-brand-light/20 hover:bg-brand-light/30 text-brand-light transition-colors"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setIsAdding(false);
                setNewEmail({ address: "", label: "Business" });
              }}
              className="p-2 rounded-lg hover:bg-white/10 text-gray-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {emails.length === 0 && !isAdding && (
        <div className="text-center py-4 text-gray-500 text-sm">
          No email addresses added yet
        </div>
      )}
    </div>
  );
}
