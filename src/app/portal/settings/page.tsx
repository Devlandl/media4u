"use client";

import { type ReactElement } from "react";
import { motion } from "motion/react";
import { useAuth } from "@/components/AuthContext";
import { User, Mail, Shield, Bell, Lock } from "lucide-react";

export default function PortalSettingsPage(): ReactElement {
  const { user, userRole } = useAuth();

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
              <label className="text-sm text-gray-400 mb-1 block">Full Name</label>
              <div className="px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white">
                {user?.name}
              </div>
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
              <div className="px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white">
                ••••••••••••
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Contact support to change your password
              </p>
            </div>
            <div className="pt-2">
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-white">Two-Factor Authentication</span>
                </div>
                <span className="text-xs text-gray-400">Coming Soon</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Notification Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-elevated rounded-2xl p-6"
        >
          <h2 className="text-xl font-display font-semibold mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-cyan-400" />
            Notifications
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
              <span className="text-sm text-white">Order Updates</span>
              <div className="w-10 h-5 rounded-full bg-cyan-500/30 relative cursor-not-allowed">
                <div className="absolute right-0.5 top-0.5 w-4 h-4 rounded-full bg-cyan-400" />
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
              <span className="text-sm text-white">Newsletter</span>
              <div className="w-10 h-5 rounded-full bg-gray-600 relative cursor-not-allowed">
                <div className="absolute left-0.5 top-0.5 w-4 h-4 rounded-full bg-gray-400" />
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
              <span className="text-sm text-white">Project Milestones</span>
              <div className="w-10 h-5 rounded-full bg-cyan-500/30 relative cursor-not-allowed">
                <div className="absolute right-0.5 top-0.5 w-4 h-4 rounded-full bg-cyan-400" />
              </div>
            </div>
            <p className="text-xs text-gray-500 pt-2">
              Contact support to update notification preferences
            </p>
          </div>
        </motion.div>

        {/* Account Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-elevated rounded-2xl p-6"
        >
          <h2 className="text-xl font-display font-semibold mb-4">
            Account Actions
          </h2>
          <div className="space-y-3">
            <button
              disabled
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-gray-400 text-sm text-left hover:bg-white/10 transition-colors disabled:cursor-not-allowed disabled:hover:bg-white/5"
            >
              Export Account Data
            </button>
            <button
              disabled
              className="w-full px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-left hover:bg-red-500/20 transition-colors disabled:cursor-not-allowed disabled:hover:bg-red-500/10"
            >
              Delete Account
            </button>
            <p className="text-xs text-gray-500 pt-2">
              For account deletion or data export, please contact support
            </p>
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
