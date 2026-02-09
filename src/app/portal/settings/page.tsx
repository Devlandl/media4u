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
        <h1 className="text-4xl font-display font-bold mb-2">
          Account <span className="text-gradient-cyber">Settings</span>
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
          className="glass-elevated rounded-2xl p-6"
        >
          <h2 className="text-xl font-display font-semibold mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-cyan-400" />
            Profile Information
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">User ID</label>
              <div className="px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-sm break-all">
                {user?.id}
              </div>
              <p className="text-xs text-gray-500 mt-1">Share this with an admin to get assigned a role</p>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Full Name</label>
              {isEditingName ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="flex-1 px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50"
                    placeholder="Enter your name"
                    disabled={isSaving}
                  />
                  <button
                    onClick={handleSaveName}
                    disabled={isSaving || !editedName.trim()}
                    className="px-4 py-3 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                    className="px-4 py-3 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-white/5 border border-white/10">
                  <span className="text-white">{user?.name}</span>
                  <button
                    onClick={handleStartEdit}
                    className="text-cyan-400 hover:text-cyan-300 transition-colors"
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
              <div className="px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" />
                {user?.email}
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Account Type</label>
              <div className="px-4 py-3 rounded-lg bg-white/5 border border-white/10">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                  userRole === "admin"
                    ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                    : userRole === "client"
                    ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                    : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
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
          className="glass-elevated rounded-2xl p-6"
        >
          <h2 className="text-xl font-display font-semibold mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5 text-cyan-400" />
            Security
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Password</label>
              <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-white/5 border border-white/10">
                <span className="text-white">••••••••••••</span>
                <Link
                  href="/reset-password"
                  className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors"
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
        className="mt-6 glass-elevated rounded-2xl p-6 text-center"
      >
        <p className="text-gray-400 text-sm mb-2">
          Need help with your account settings?
        </p>
        <a
          href="/portal/support"
          className="text-cyan-400 hover:text-cyan-300 transition-colors text-sm font-medium"
        >
          Contact Support →
        </a>
      </motion.div>
    </div>
  );
}
