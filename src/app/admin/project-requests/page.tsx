/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { motion } from "motion/react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@convex/_generated/api";
import { useState } from "react";
import { Id } from "@convex/_generated/dataModel";
import { Mail, Send } from "lucide-react";
import { EmailReplyModal } from "@/components/admin/EmailReplyModal";

type ProjectStatus = "new" | "contacted" | "quoted" | "accepted" | "declined";

const statusColors: Record<ProjectStatus, string> = {
  new: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  contacted: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  quoted: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  accepted: "bg-green-500/20 text-green-400 border-green-500/30",
  declined: "bg-red-500/20 text-red-400 border-red-500/30",
};

const statusLabels: Record<ProjectStatus, string> = {
  new: "New",
  contacted: "Contacted",
  quoted: "Quoted",
  accepted: "Accepted",
  declined: "Declined",
};

export default function ProjectRequestsAdminPage() {
  const requests = useQuery(api.projectRequests.getProjectRequests, {});
  const updateStatus = useMutation(api.projectRequests.updateProjectStatus);
  const deleteRequest = useMutation(api.projectRequests.deleteProjectRequest);
  const subscribeToNewsletter = useMutation(api.newsletter.subscribeToNewsletter);
  const sendEmailReply = useAction(api.emailReplies.sendEmailReply);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<ProjectStatus | "all">("all");
  const [subscribing, setSubscribing] = useState<string | null>(null);
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);

  const filtered =
    requests && filterStatus !== "all"
      ? requests.filter((r: any) => r.status === filterStatus)
      : requests;

  const selected = requests?.find((r: any) => r._id === selectedId);

  async function handleStatusChange(id: Id<"projectRequests">, newStatus: ProjectStatus) {
    await updateStatus({ id, status: newStatus });
  }

  async function handleDelete(id: Id<"projectRequests">) {
    if (confirm("Delete this project request?")) {
      await deleteRequest({ id });
      setSelectedId(null);
    }
  }

  async function handleAddToNewsletter(email: string, requestId: string) {
    setSubscribing(requestId);
    try {
      const result = await subscribeToNewsletter({ email });
      if (result.success) {
        if (result.newSubscription) {
          alert("Email added to newsletter subscribers!");
        } else {
          alert("Email was already subscribed to newsletter.");
        }
      } else {
        alert(result.error || "Failed to subscribe email");
      }
    } catch (error) {
      console.error("Error subscribing:", error);
      alert("Failed to add email to newsletter");
    } finally {
      setSubscribing(null);
    }
  }

  async function handleSendReply(message: string) {
    if (!selected) return;

    await sendEmailReply({
      to: selected.email,
      subject: `Re: Your Project Request - ${selected.projectTypes.join(", ")}`,
      message,
      recipientName: selected.name,
    });

    // Mark as contacted
    await handleStatusChange(selected._id, "contacted");
  }

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-display font-bold mb-2">Project Requests</h1>
        <p className="text-gray-400">Manage project requests from Start a Project form</p>
      </motion.div>

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        {(["all", "new", "contacted", "quoted", "accepted", "declined"] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filterStatus === status
                ? "bg-cyan-500/30 text-cyan-400 border border-cyan-500/50"
                : "bg-white/5 text-gray-400 hover:text-white border border-white/10"
            }`}
          >
            {status === "all" ? "All" : statusLabels[status]}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-1"
        >
          <div className="glass-elevated rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-white/10 bg-white/5">
              <p className="text-sm font-semibold text-gray-300">
                {filtered?.length || 0} Requests
              </p>
            </div>
            <div className="divide-y divide-white/10 max-h-[600px] overflow-y-auto">
              {filtered?.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  No project requests found
                </div>
              ) : (
                filtered?.map((request: any) => (
                  <motion.button
                    key={request._id}
                    onClick={() => setSelectedId(request._id)}
                    whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                    className={`w-full p-4 text-left transition-all border-l-4 ${
                      selectedId === request._id
                        ? "border-cyan-500 bg-white/10"
                        : "border-transparent hover:border-white/20"
                    }`}
                  >
                    <p className="font-semibold text-white text-sm truncate">{request.name}</p>
                    <p className="text-xs text-gray-400 truncate">{request.email}</p>
                    {request.businessName && (
                      <p className="text-xs text-gray-500 truncate">{request.businessName}</p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded border ${statusColors[request.status as ProjectStatus]}`}
                      >
                        {statusLabels[request.status as ProjectStatus]}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </motion.button>
                ))
              )}
            </div>
          </div>
        </motion.div>

        {/* Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          {selected ? (
            <div className="glass-elevated rounded-2xl p-6 space-y-6">
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Name</p>
                <p className="text-xl font-semibold text-white">{selected.name}</p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Email</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <a href={`mailto:${selected.email}`} className="text-cyan-400 hover:text-cyan-300">
                    {selected.email}
                  </a>
                  <button
                    onClick={() => setIsReplyModalOpen(true)}
                    className="px-3 py-1 rounded-lg bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 transition-colors border border-cyan-500/50 text-xs font-medium flex items-center gap-1"
                  >
                    <Send className="w-3 h-3" />
                    Reply
                  </button>
                  <button
                    onClick={() => handleAddToNewsletter(selected.email, selected._id)}
                    disabled={subscribing === selected._id}
                    className="px-3 py-1 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors border border-purple-500/50 text-xs font-medium flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Mail className="w-3 h-3" />
                    {subscribing === selected._id ? "Adding..." : "Add to Newsletter"}
                  </button>
                </div>
              </div>

              {selected.businessName && (
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Business Name</p>
                  <p className="text-white">{selected.businessName}</p>
                </div>
              )}

              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Project Types</p>
                <div className="flex flex-wrap gap-2">
                  {selected.projectTypes.map((type: string) => (
                    <span
                      key={type}
                      className="px-2 py-1 rounded-lg bg-cyan-500/20 text-cyan-400 text-xs border border-cyan-500/30"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Timeline</p>
                <p className="text-white">{selected.timeline}</p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Budget</p>
                <p className="text-white">{selected.budget}</p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Description</p>
                <p className="text-gray-300 whitespace-pre-wrap">{selected.description}</p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Submitted</p>
                <p className="text-white">
                  {new Date(selected.createdAt).toLocaleString()}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500 mb-3">Status</p>
                <div className="flex gap-2 flex-wrap">
                  {(["new", "contacted", "quoted", "accepted", "declined"] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(selected._id, status)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        selected.status === status
                          ? statusColors[status] + " border"
                          : "bg-white/5 text-gray-400 hover:text-white border border-white/10"
                      }`}
                    >
                      {statusLabels[status]}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => handleDelete(selected._id)}
                className="w-full px-4 py-3 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all border border-red-500/30 font-medium"
              >
                Delete Request
              </button>
            </div>
          ) : (
            <div className="glass-elevated rounded-2xl p-12 text-center">
              <p className="text-gray-400">Select a project request to view details</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Email Reply Modal */}
      {selected && (
        <EmailReplyModal
          isOpen={isReplyModalOpen}
          onClose={() => setIsReplyModalOpen(false)}
          recipientEmail={selected.email}
          recipientName={selected.name}
          subject={`Re: Your Project Request - ${selected.projectTypes.join(", ")}`}
          onSend={handleSendReply}
        />
      )}
    </div>
  );
}
