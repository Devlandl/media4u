"use client";

import { motion } from "motion/react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useState } from "react";
import type { Id } from "@convex/_generated/dataModel";

interface User {
  _id: Id<"users">;
  email: string;
  name: string;
  role: "user" | "admin";
  status: "pending" | "approved" | "rejected";
  createdAt: number;
}

export default function UsersPage() {
  const users = useQuery(api.users.getAllUsers);
  const approveUser = useMutation(api.users.approveUser);
  const rejectUser = useMutation(api.users.rejectUser);
  const deleteUser = useMutation(api.users.deleteUser);
  const promoteToAdmin = useMutation(api.users.promoteToAdmin);
  const demoteToUser = useMutation(api.users.demoteToUser);

  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const filteredUsers = users?.filter(user => {
    if (filter === "all") return true;
    return user.status === filter;
  });

  const handleApprove = async (userId: Id<"users">) => {
    setActionLoading(userId);
    try {
      await approveUser({ userId });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (userId: Id<"users">) => {
    setActionLoading(userId);
    try {
      await rejectUser({ userId });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (userId: Id<"users">) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return;
    }
    setActionLoading(userId);
    try {
      await deleteUser({ userId });
    } finally {
      setActionLoading(null);
    }
  };

  const handlePromote = async (userId: Id<"users">) => {
    if (!confirm("Promote this user to admin? They will have full access to the admin panel.")) {
      return;
    }
    setActionLoading(userId);
    try {
      await promoteToAdmin({ userId });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDemote = async (userId: Id<"users">) => {
    if (!confirm("Demote this admin to regular user? They will lose admin access.")) {
      return;
    }
    setActionLoading(userId);
    try {
      await demoteToUser({ userId });
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
      approved: "bg-green-500/20 text-green-300 border-green-500/30",
      rejected: "bg-red-500/20 text-red-300 border-red-500/30",
    };
    return styles[status as keyof typeof styles] || "";
  };

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-display font-bold mb-2">User Management</h1>
        <p className="text-gray-400">Approve, reject, or manage user accounts</p>
      </motion.div>

      {/* Filter Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex gap-2 flex-wrap"
      >
        {["all", "pending", "approved", "rejected"].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status as typeof filter)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === status
                ? "bg-cyan-500 text-white"
                : "bg-white/5 text-gray-400 hover:bg-white/10"
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
            {status !== "all" && users && (
              <span className="ml-2 text-xs opacity-70">
                ({users.filter(u => u.status === status).length})
              </span>
            )}
          </button>
        ))}
      </motion.div>

      {/* Users Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-elevated rounded-2xl overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 text-gray-400 font-medium">Name</th>
                <th className="text-left p-4 text-gray-400 font-medium">Email</th>
                <th className="text-left p-4 text-gray-400 font-medium">Role</th>
                <th className="text-left p-4 text-gray-400 font-medium">Status</th>
                <th className="text-left p-4 text-gray-400 font-medium">Joined</th>
                <th className="text-left p-4 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {!filteredUsers ? (
                <tr>
                  <td colSpan={6} className="text-center p-8 text-gray-400">
                    Loading users...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center p-8 text-gray-400">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user: User) => (
                  <tr
                    key={user._id}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="p-4 text-white font-medium">{user.name}</td>
                    <td className="p-4 text-gray-300">{user.email}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        user.role === "admin"
                          ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                          : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusBadge(user.status)}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="p-4 text-gray-400 text-sm">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2 flex-wrap">
                        {user.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleApprove(user._id)}
                              disabled={actionLoading === user._id}
                              className="px-3 py-1 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded text-sm font-medium transition-colors disabled:opacity-50"
                            >
                              {actionLoading === user._id ? "..." : "Approve"}
                            </button>
                            <button
                              onClick={() => handleReject(user._id)}
                              disabled={actionLoading === user._id}
                              className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded text-sm font-medium transition-colors disabled:opacity-50"
                            >
                              {actionLoading === user._id ? "..." : "Reject"}
                            </button>
                          </>
                        )}
                        {user.status === "rejected" && (
                          <button
                            onClick={() => handleApprove(user._id)}
                            disabled={actionLoading === user._id}
                            className="px-3 py-1 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded text-sm font-medium transition-colors disabled:opacity-50"
                          >
                            {actionLoading === user._id ? "..." : "Approve"}
                          </button>
                        )}
                        {user.status === "approved" && (
                          <button
                            onClick={() => handleReject(user._id)}
                            disabled={actionLoading === user._id}
                            className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded text-sm font-medium transition-colors disabled:opacity-50"
                          >
                            {actionLoading === user._id ? "..." : "Revoke"}
                          </button>
                        )}

                        {/* Role Management */}
                        {user.role === "user" ? (
                          <button
                            onClick={() => handlePromote(user._id)}
                            disabled={actionLoading === user._id}
                            className="px-3 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded text-sm font-medium transition-colors disabled:opacity-50"
                          >
                            {actionLoading === user._id ? "..." : "Make Admin"}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleDemote(user._id)}
                            disabled={actionLoading === user._id}
                            className="px-3 py-1 bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 rounded text-sm font-medium transition-colors disabled:opacity-50"
                          >
                            {actionLoading === user._id ? "..." : "Remove Admin"}
                          </button>
                        )}

                        {user.role !== "admin" && (
                          <button
                            onClick={() => handleDelete(user._id)}
                            disabled={actionLoading === user._id}
                            className="px-3 py-1 bg-gray-500/20 hover:bg-gray-500/30 text-gray-300 rounded text-sm font-medium transition-colors disabled:opacity-50"
                          >
                            {actionLoading === user._id ? "..." : "Delete"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Stats Summary */}
      {users && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <div className="glass-elevated rounded-xl p-4">
            <p className="text-gray-400 text-sm mb-1">Total Users</p>
            <p className="text-2xl font-bold text-white">{users.length}</p>
          </div>
          <div className="glass-elevated rounded-xl p-4">
            <p className="text-gray-400 text-sm mb-1">Pending</p>
            <p className="text-2xl font-bold text-yellow-300">
              {users.filter(u => u.status === "pending").length}
            </p>
          </div>
          <div className="glass-elevated rounded-xl p-4">
            <p className="text-gray-400 text-sm mb-1">Approved</p>
            <p className="text-2xl font-bold text-green-300">
              {users.filter(u => u.status === "approved").length}
            </p>
          </div>
          <div className="glass-elevated rounded-xl p-4">
            <p className="text-gray-400 text-sm mb-1">Rejected</p>
            <p className="text-2xl font-bold text-red-300">
              {users.filter(u => u.status === "rejected").length}
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
