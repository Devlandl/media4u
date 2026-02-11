"use client";

import { type ReactElement, useState } from "react";
import { motion } from "motion/react";
import { useAuth } from "@/components/AuthContext";
import { User, Mail, Lock, Edit2, Check, X, Loader2 } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import Link from "next/link";

export default function PortalSettingsPage(): ReactElement {
  const { user, userRole } = useAuth();
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const updateUserName = useMutation(api.users.updateUserName);

  const handleStartEdit = () => {
    setEditedName(user?.name || "");
    setIsEditingName(true);
  };

  const handleCancelEdit = () => {
    setIsEditingName(false);
    setEditedName("");
  };

  const handleSaveName = async () => {
    if (!editedName.trim() || !user?.id) return;

    setIsSaving(true);
    try {
      await updateUserName({ userId: user.id, name: editedName.trim() });
      setSaveSuccess(true);
      setIsEditingName(false);
      setTimeout(() => setSaveSuccess(false), 3000);
      // Refresh the page to show updated name
      window.location.reload();
    } catch (error) {
      console.error("Failed to update name:", error);
      alert("Failed to update name. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-xl lg:text-2xl font-semibold mb-2">
          Account <span className="text-white">Settings</span>
        </h1>
        <p className="text-gray-400">
          Manage your profile, security, and preferences.
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Profile Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 lg:p-6"
        >
          <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-zinc-400" />
            Profile Information
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Full Name</label>
              {isEditingName ? (
                <div className="flex flex-wrap gap-2">
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="flex-1 min-w-0 px-4 py-3 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600"
                    placeholder="Enter your name"
                    disabled={isSaving}
                  />
                  <button
                    onClick={handleSaveName}
                    disabled={isSaving || !editedName.trim()}
                    className="px-4 py-3 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                    className="px-4 py-3 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-zinc-800/50 border border-zinc-800">
                  <span className="text-white">{user?.name}</span>
                  <button
                    onClick={handleStartEdit}
                    className="text-zinc-300 hover:text-white transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              )}
              {saveSuccess && (
                <p className="text-xs text-green-400 mt-1 flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Name updated successfully!
                </p>
              )}
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Email Address</label>
              <div className="px-4 py-3 rounded-lg bg-zinc-800/50 border border-zinc-800 text-white flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" />
                {user?.email}
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Account Type</label>
              <div className="px-4 py-3 rounded-lg bg-zinc-800/50 border border-zinc-800">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                  userRole === "admin"
                    ? "bg-violet-500/10 text-violet-400 border border-violet-500/20"
                    : userRole === "client"
                    ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                    : "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20"
                }`}>
                  {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Security Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 lg:p-6"
        >
          <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5 text-zinc-400" />
            Security
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Password</label>
              <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-zinc-800/50 border border-zinc-800">
                <span className="text-white">••••••••••••</span>
                <Link
                  href="/reset-password"
                  className="text-zinc-300 hover:text-white text-sm font-medium transition-colors"
                >
                  Change Password
                </Link>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                You&apos;ll receive an email with reset instructions
              </p>
            </div>
          </div>
        </motion.div>

      </div>

      {/* Support Contact Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-6 bg-zinc-900 border border-zinc-800 rounded-xl p-4 lg:p-6 text-center"
      >
        <p className="text-gray-400 text-sm mb-2">
          Need help with your account settings?
        </p>
        <a
          href="/portal/support"
          className="text-zinc-300 hover:text-white transition-colors text-sm font-medium"
        >
          Contact Support →
        </a>
      </motion.div>
    </div>
  );
}
