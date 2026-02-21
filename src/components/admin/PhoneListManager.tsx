"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Phone, Plus, X, Check, Star } from "lucide-react";

type PhoneType = {
  number: string;
  label: string;
  isPrimary: boolean;
};

type PhoneListManagerProps = {
  phones: PhoneType[];
  onChange: (phones: PhoneType[]) => void;
  disabled?: boolean;
};

const PHONE_LABELS = ["Mobile", "Business", "Home", "Work", "Other"];

export default function PhoneListManager({ phones, onChange, disabled }: PhoneListManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newPhone, setNewPhone] = useState({ number: "", label: "Mobile" });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleAdd = () => {
    if (!newPhone.number.trim()) return;

    const phoneToAdd: PhoneType = {
      number: newPhone.number.trim(),
      label: newPhone.label,
      isPrimary: phones.length === 0, // First phone is automatically primary
    };

    onChange([...phones, phoneToAdd]);
    setNewPhone({ number: "", label: "Mobile" });
    setIsAdding(false);
  };

  const handleUpdate = (index: number, updates: Partial<PhoneType>) => {
    const updated = phones.map((phone, i) =>
      i === index ? { ...phone, ...updates } : phone
    );
    onChange(updated);
    setEditingIndex(null);
  };

  const handleRemove = (index: number) => {
    const phoneToRemove = phones[index];
    const remaining = phones.filter((_, i) => i !== index);

    // If removing primary phone and there are others, make the first one primary
    if (phoneToRemove.isPrimary && remaining.length > 0) {
      remaining[0] = { ...remaining[0], isPrimary: true };
    }

    onChange(remaining);
  };

  const handleSetPrimary = (index: number) => {
    const updated = phones.map((phone, i) => ({
      ...phone,
      isPrimary: i === index,
    }));
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-white flex items-center gap-2">
          <Phone className="w-4 h-4 text-brand-light" />
          Phone Numbers
        </label>
        {!isAdding && !disabled && (
          <button
            onClick={() => setIsAdding(true)}
            className="text-xs text-brand-light hover:text-white transition-colors flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />
            Add Phone
          </button>
        )}
      </div>

      <AnimatePresence mode="popLayout">
        {phones.map((phone, index) => (
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
                  type="tel"
                  value={phone.number}
                  onChange={(e) => handleUpdate(index, { number: e.target.value })}
                  className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-brand-light/50"
                  placeholder="(555) 123-4567"
                  autoFocus
                />
                <select
                  value={phone.label}
                  onChange={(e) => handleUpdate(index, { label: e.target.value })}
                  className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-brand-light/50"
                >
                  {PHONE_LABELS.map((label) => (
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
                    <span className="text-white text-sm">{phone.number}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-brand-light/20 text-brand-light border border-brand-light/30">
                      {phone.label}
                    </span>
                    {phone.isPrimary && (
                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    )}
                  </div>
                </div>
                {!disabled && (
                  <div className="flex items-center gap-1">
                    {!phone.isPrimary && (
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
                    {phones.length > 1 && (
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
              type="tel"
              value={newPhone.number}
              onChange={(e) => setNewPhone({ ...newPhone, number: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-brand-light/50"
              placeholder="(555) 123-4567"
              autoFocus
            />
            <select
              value={newPhone.label}
              onChange={(e) => setNewPhone({ ...newPhone, label: e.target.value })}
              className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-brand-light/50"
            >
              {PHONE_LABELS.map((label) => (
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
                setNewPhone({ number: "", label: "Mobile" });
              }}
              className="p-2 rounded-lg hover:bg-white/10 text-gray-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {phones.length === 0 && !isAdding && (
        <div className="text-center py-4 text-gray-500 text-sm">
          No phone numbers added yet
        </div>
      )}
    </div>
  );
}
