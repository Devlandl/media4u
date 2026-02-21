"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { X, Save, Tag, Globe, Clock, Users } from "lucide-react";
import SimpleEmailListManager from "./SimpleEmailListManager";
import PhoneListManager from "./PhoneListManager";
import AddressFields from "./AddressFields";

type EmailType = {
  address: string;
  label: string;
  isPrimary: boolean;
};

type PhoneType = {
  number: string;
  label: string;
  isPrimary: boolean;
};

type AddressType = {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
};

type ClientData = {
  primaryEmail: string;
  name: string;
  company?: string;
  website?: string;
  emails: EmailType[];
  phones?: PhoneType[];
  address?: AddressType;
  tags?: string[];
  preferredContact?: "email" | "phone" | "text";
  timezone?: string;
  referralSource?: string;
  notes?: string;
};

type EditClientModalProps = {
  client: ClientData;
  onClose: () => void;
  onSuccess: () => void;
};

const TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Phoenix",
  "America/Anchorage",
  "Pacific/Honolulu",
];

const COMMON_TAGS = ["VR", "Website", "E-commerce", "Referral", "Hot Lead", "VIP", "Past Client"];

export default function EditClientModal({ client, onClose, onSuccess }: EditClientModalProps) {
  const [formData, setFormData] = useState<ClientData>(client);
  const [newTag, setNewTag] = useState("");
  const updateClient = useMutation(api.clientManagement.updateClientInfo);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateClient({
        primaryEmail: formData.primaryEmail,
        updates: {
          name: formData.name,
          company: formData.company || undefined,
          website: formData.website || undefined,
          phones: formData.phones && formData.phones.length > 0 ? formData.phones : undefined,
          address: formData.address,
          tags: formData.tags && formData.tags.length > 0 ? formData.tags : undefined,
          preferredContact: formData.preferredContact,
          timezone: formData.timezone || undefined,
          referralSource: formData.referralSource || undefined,
          notes: formData.notes || undefined,
        },
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to update client:", error);
      alert("Failed to update client. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddTag = () => {
    if (!newTag.trim()) return;
    const tags = formData.tags || [];
    if (!tags.includes(newTag.trim())) {
      setFormData({ ...formData, tags: [...tags, newTag.trim()] });
    }
    setNewTag("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: (formData.tags || []).filter((tag) => tag !== tagToRemove),
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl glass-elevated"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div>
              <h2 className="text-2xl font-bold text-white">Edit Client</h2>
              <p className="text-sm text-gray-400 mt-1">{formData.primaryEmail}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)] space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-brand-light/50"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Company</label>
                <input
                  type="text"
                  value={formData.company || ""}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-brand-light/50"
                  placeholder="Company name"
                />
              </div>
            </div>

            {/* Email List */}
            <SimpleEmailListManager
              emails={formData.emails}
              onChange={(emails) => setFormData({ ...formData, emails })}
            />

            {/* Phone List */}
            <PhoneListManager
              phones={formData.phones || []}
              onChange={(phones) => setFormData({ ...formData, phones })}
            />

            {/* Address */}
            <AddressFields
              address={formData.address}
              onChange={(address) => setFormData({ ...formData, address })}
            />

            {/* Website & Preferred Contact */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-brand-light" />
                  Website
                </label>
                <input
                  type="url"
                  value={formData.website || ""}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-brand-light/50"
                  placeholder="https://example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Preferred Contact
                </label>
                <select
                  value={formData.preferredContact || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      preferredContact: e.target.value as "email" | "phone" | "text" | undefined,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-brand-light/50"
                >
                  <option value="">Not specified</option>
                  <option value="email">Email</option>
                  <option value="phone">Phone</option>
                  <option value="text">Text</option>
                </select>
              </div>
            </div>

            {/* Timezone & Referral Source */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-brand-light" />
                  Timezone
                </label>
                <select
                  value={formData.timezone || ""}
                  onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-brand-light/50"
                >
                  <option value="">Not specified</option>
                  {TIMEZONES.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz.replace("America/", "").replace("Pacific/", "").replace("_", " ")}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4 text-brand-light" />
                  Referral Source
                </label>
                <input
                  type="text"
                  value={formData.referralSource || ""}
                  onChange={(e) => setFormData({ ...formData, referralSource: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-brand-light/50"
                  placeholder="How they found you"
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-white mb-2 flex items-center gap-2">
                <Tag className="w-4 h-4 text-brand-light" />
                Tags
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {(formData.tags || []).map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-brand-light/20 text-brand-light border border-brand-light/30 text-sm"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-white transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
                  className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-brand-light/50"
                  placeholder="Add a tag..."
                />
                <button
                  onClick={handleAddTag}
                  className="px-4 py-2 rounded-lg bg-brand-light/20 hover:bg-brand-light/30 text-brand-light transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="text-xs text-gray-500">Quick add:</span>
                {COMMON_TAGS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      const tags = formData.tags || [];
                      if (!tags.includes(tag)) {
                        setFormData({ ...formData, tags: [...tags, tag] });
                      }
                    }}
                    className="text-xs px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Notes</label>
              <textarea
                value={formData.notes || ""}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-brand-light/50 resize-none"
                placeholder="Internal notes about this client..."
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-white/10">
            <button
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 rounded-lg border border-white/10 text-white hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || !formData.name.trim()}
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-brand-light to-brand-primary text-white font-medium hover:shadow-[0_0_20px_rgba(8,145,178,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
