"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Mail, Plus, Star, Edit2, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

type Email = {
  address: string;
  label: string;
  isPrimary: boolean;
};

type TableType = "projects" | "contactSubmissions" | "projectRequests" | "leads";

interface EmailListManagerProps {
  emails: Email[];
  legacyEmail: string; // The old single email field
  recordId: string;
  tableName: TableType;
  onUpdate?: () => void;
}

export function EmailListManager({
  emails = [],
  legacyEmail,
  recordId,
  tableName,
  onUpdate,
}: EmailListManagerProps) {
  const addEmail = useMutation(api.emailManagement.addEmail);
  const updateEmail = useMutation(api.emailManagement.updateEmail);
  const removeEmail = useMutation(api.emailManagement.removeEmail);
  const setPrimaryEmail = useMutation(api.emailManagement.setPrimaryEmail);

  const [isAddingEmail, setIsAddingEmail] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [newEmail, setNewEmail] = useState({ address: "", label: "Personal", isPrimary: false });

  // Combine legacy email with new emails list for display
  const allEmails = emails.length > 0
    ? emails
    : [{ address: legacyEmail, label: "Primary", isPrimary: true }];

  async function handleAddEmail() {
    if (!newEmail.address.trim()) {
      alert("Please enter an email address");
      return;
    }

    try {
      await addEmail({
        table: tableName,
        recordId,
        email: newEmail,
      });
      setNewEmail({ address: "", label: "Personal", isPrimary: false });
      setIsAddingEmail(false);
      onUpdate?.();
    } catch (error) {
      console.error("Failed to add email:", error);
      alert("Failed to add email");
    }
  }

  async function handleUpdateEmail(index: number) {
    if (!newEmail.address.trim()) {
      alert("Please enter an email address");
      return;
    }

    try {
      await updateEmail({
        table: tableName,
        recordId,
        emailIndex: index,
        email: newEmail,
      });
      setNewEmail({ address: "", label: "Personal", isPrimary: false });
      setEditingIndex(null);
      onUpdate?.();
    } catch (error) {
      console.error("Failed to update email:", error);
      alert("Failed to update email");
    }
  }

  async function handleRemoveEmail(index: number) {
    if (allEmails.length === 1) {
      alert("Cannot remove the last email. A client must have at least one email.");
      return;
    }

    if (confirm("Remove this email address?")) {
      try {
        await removeEmail({
          table: tableName,
          recordId,
          emailIndex: index,
        });
        onUpdate?.();
      } catch (error) {
        console.error("Failed to remove email:", error);
        alert("Failed to remove email");
      }
    }
  }

  async function handleSetPrimary(index: number) {
    try {
      await setPrimaryEmail({
        table: tableName,
        recordId,
        emailIndex: index,
      });
      onUpdate?.();
    } catch (error) {
      console.error("Failed to set primary email:", error);
      alert("Failed to set primary email");
    }
  }

  function startEditing(index: number) {
    const email = allEmails[index];
    setNewEmail(email);
    setEditingIndex(index);
    setIsAddingEmail(false);
  }

  function cancelEditing() {
    setNewEmail({ address: "", label: "Personal", isPrimary: false });
    setEditingIndex(null);
    setIsAddingEmail(false);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs uppercase tracking-wider text-gray-500">Email Addresses</p>
        <button
          onClick={() => {
            setIsAddingEmail(true);
            setEditingIndex(null);
            setNewEmail({ address: "", label: "Personal", isPrimary: false });
          }}
          className="text-xs text-brand-light hover:text-brand-dark flex items-center gap-1"
        >
          <Plus className="w-3 h-3" />
          Add Email
        </button>
      </div>

      <div className="space-y-2">
        {/* Existing Emails */}
        {allEmails.map((email, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10"
          >
            <div className="flex items-center gap-3 flex-1">
              <Mail className="w-4 h-4 text-brand-light" />
              <div className="flex-1">
                <a
                  href={`mailto:${email.address}`}
                  className="text-white hover:text-brand-light transition-colors block"
                >
                  {email.address}
                </a>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs px-2 py-0.5 rounded bg-brand-light/20 text-brand-light border border-brand-light/30">
                    {email.label}
                  </span>
                  {email.isPrimary && (
                    <span className="text-xs px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      Primary
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {!email.isPrimary && (
                <button
                  onClick={() => handleSetPrimary(index)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  title="Set as primary"
                >
                  <Star className="w-4 h-4 text-gray-400 hover:text-yellow-400" />
                </button>
              )}
              <button
                onClick={() => startEditing(index)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                title="Edit email"
              >
                <Edit2 className="w-4 h-4 text-gray-400 hover:text-brand-light" />
              </button>
              <button
                onClick={() => handleRemoveEmail(index)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                title="Remove email"
              >
                <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-400" />
              </button>
            </div>
          </div>
        ))}

        {/* Add/Edit Email Form */}
        <AnimatePresence>
          {(isAddingEmail || editingIndex !== null) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 rounded-lg bg-white/5 border border-brand-light/30 space-y-3">
                <p className="text-sm font-medium text-white">
                  {editingIndex !== null ? "Edit Email" : "Add New Email"}
                </p>

                <div>
                  <label className="block text-xs text-gray-400 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={newEmail.address}
                    onChange={(e) => setNewEmail({ ...newEmail, address: e.target.value })}
                    placeholder="name@example.com"
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-brand-light/50"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1">Label</label>
                  <select
                    value={newEmail.label}
                    onChange={(e) => setNewEmail({ ...newEmail, label: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-brand-light/50 [&>option]:bg-gray-800 [&>option]:text-white"
                  >
                    <option value="Personal">Personal</option>
                    <option value="Business">Business</option>
                    <option value="Work">Work</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newEmail.isPrimary}
                    onChange={(e) => setNewEmail({ ...newEmail, isPrimary: e.target.checked })}
                    className="rounded"
                  />
                  Set as primary email
                </label>

                <div className="flex gap-2">
                  <button
                    onClick={cancelEditing}
                    className="flex-1 px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (editingIndex !== null) {
                        handleUpdateEmail(editingIndex);
                      } else {
                        handleAddEmail();
                      }
                    }}
                    className="flex-1 px-4 py-2 rounded-lg bg-brand-light text-white hover:bg-brand-dark transition-colors"
                  >
                    {editingIndex !== null ? "Update" : "Add"}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
