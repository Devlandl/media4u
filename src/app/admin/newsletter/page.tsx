"use client";

import { motion } from "motion/react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useState } from "react";
import { Download } from "lucide-react";

export default function NewsletterAdminPage() {
  const subscribers = useQuery(api.newsletter.getNewsletterSubscribers, {
    unsubscribedOnly: false,
  });
  const unsubscribe = useMutation(api.newsletter.unsubscribeFromNewsletter);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  const activeSubscribers = subscribers?.filter((s) => !s.unsubscribed) || [];
  const unsubscribedList = subscribers?.filter((s) => s.unsubscribed) || [];

  function copyToClipboard(email: string) {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2000);
  }

  function exportCSV() {
    if (!activeSubscribers.length) return;

    const csv = ["Email", "Subscribed Date"]
      .concat(
        activeSubscribers.map(
          (s) =>
            `"${s.email}","${new Date(s.subscribedAt).toLocaleDateString()}"`
        )
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `newsletter-subscribers-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-display font-bold mb-2">Newsletter Subscribers</h1>
        <p className="text-gray-400">Manage your email list</p>
      </motion.div>

      {/* Stats */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-elevated rounded-2xl p-6"
        >
          <p className="text-gray-400 text-sm mb-2">Active Subscribers</p>
          <p className="text-4xl font-bold text-cyan-400">{activeSubscribers.length}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-elevated rounded-2xl p-6"
        >
          <p className="text-gray-400 text-sm mb-2">Unsubscribed</p>
          <p className="text-4xl font-bold text-gray-400">{unsubscribedList.length}</p>
        </motion.div>
      </div>

      {/* Export Button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        onClick={exportCSV}
        disabled={activeSubscribers.length === 0}
        className="mb-6 px-6 py-3 rounded-lg bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 transition-all border border-cyan-500/50 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        <Download className="w-4 h-4" /> Export to CSV
      </motion.button>

      {/* Active Subscribers */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-display font-bold mb-4">Active Subscribers</h2>
        <div className="glass-elevated rounded-2xl overflow-hidden">
          {activeSubscribers.length === 0 ? (
            <div className="p-8 text-center text-gray-400">No active subscribers yet</div>
          ) : (
            <div className="divide-y divide-white/10">
              {activeSubscribers.map((subscriber) => (
                <motion.div
                  key={subscriber._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-4 flex items-center justify-between hover:bg-white/5 transition-all"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-white">{subscriber.email}</p>
                    <p className="text-xs text-gray-400">
                      Subscribed: {new Date(subscriber.subscribedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyToClipboard(subscriber.email)}
                      className="px-3 py-1 rounded text-sm bg-white/10 hover:bg-white/20 transition-all"
                    >
                      {copiedEmail === subscriber.email ? "✓ Copied" : "Copy"}
                    </button>
                    <button
                      onClick={() => unsubscribe({ email: subscriber.email })}
                      className="px-3 py-1 rounded text-sm bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                    >
                      Unsubscribe
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Unsubscribed */}
      {unsubscribedList.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-2xl font-display font-bold mb-4">Unsubscribed ({unsubscribedList.length})</h2>
          <div className="glass-elevated rounded-2xl overflow-hidden">
            <div className="divide-y divide-white/10">
              {unsubscribedList.map((subscriber) => (
                <div key={subscriber._id} className="p-4 opacity-60">
                  <p className="font-semibold text-gray-400">{subscriber.email}</p>
                  <p className="text-xs text-gray-500">
                    Unsubscribed: {new Date(subscriber.subscribedAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
