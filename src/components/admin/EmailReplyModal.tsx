"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Send } from "lucide-react";

// Reusable modal for sending email replies from admin panel
interface EmailReplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientEmail: string;
  recipientName: string;
  subject: string;
  onSend: (message: string) => Promise<void>;
}

export function EmailReplyModal({
  isOpen,
  onClose,
  recipientEmail,
  recipientName,
  subject,
  onSend,
}: EmailReplyModalProps) {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  async function handleSend() {
    if (!message.trim()) {
      alert("Please enter a message");
      return;
    }

    setIsSending(true);
    try {
      await onSend(message);
      alert("Email sent successfully!");
      setMessage("");
      onClose();
    } catch (error) {
      console.error("Failed to send email:", error);
      alert("Failed to send email. Please try again.");
    } finally {
      setIsSending(false);
    }
  }

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-dark-card rounded-2xl max-w-2xl w-full border border-white/10"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white">Send Email Reply</h3>
              <p className="text-sm text-gray-400 mt-1">Reply to {recipientName}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            {/* To Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                To:
              </label>
              <div className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white">
                {recipientEmail}
              </div>
            </div>

            {/* Subject Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Subject:
              </label>
              <div className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white">
                {subject}
              </div>
            </div>

            {/* Message Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Message:
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your reply here..."
                rows={12}
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 resize-none"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-white/10 flex gap-3 justify-end">
            <button
              onClick={onClose}
              disabled={isSending}
              className="px-6 py-3 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={isSending || !message.trim()}
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 text-white hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              {isSending ? "Sending..." : "Send Reply"}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
