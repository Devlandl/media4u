"use client";

import { useState } from "react";
import { useMutation, useAction } from "convex/react";
import { api } from "@convex/_generated/api";
import { Doc, Id } from "@convex/_generated/dataModel";
import { motion } from "motion/react";
import {
  Mail, Send, Briefcase, Building2, DollarSign,
  Clock, Calendar, Trash2, ArrowLeft,
} from "lucide-react";
import { EmailReplyModal } from "@/components/admin/EmailReplyModal";
import { EmailListManager } from "@/components/admin/EmailListManager";

type ProjectStatus = "new" | "contacted" | "quoted" | "accepted" | "declined";

const STATUS_COLORS: Record<ProjectStatus, string> = {
  new: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  contacted: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  quoted: "bg-brand-dark/20 text-brand-light border-brand-dark/30",
  accepted: "bg-green-500/20 text-green-400 border-green-500/30",
  declined: "bg-red-500/20 text-red-400 border-red-500/30",
};

const STATUS_LABELS: Record<ProjectStatus, string> = {
  new: "New",
  contacted: "Contacted",
  quoted: "Quoted",
  accepted: "Accepted",
  declined: "Declined",
};

type RequestDetailProps = {
  data: Doc<"projectRequests">;
  onClose: () => void;
};

export function RequestDetail({ data, onClose }: RequestDetailProps) {
  const updateStatus = useMutation(api.projectRequests.updateProjectStatus);
  const deleteRequest = useMutation(api.projectRequests.deleteProjectRequest);
  const subscribeToNewsletter = useMutation(api.newsletter.subscribeToNewsletter);
  const sendEmailReply = useAction(api.emailReplies.sendEmailReply);
  const createProjectFromRequest = useMutation(api.projects.createProjectFromRequest);

  const [subscribing, setSubscribing] = useState(false);
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);

  async function handleStatusChange(status: ProjectStatus) {
    await updateStatus({ id: data._id as Id<"projectRequests">, status });
  }

  async function handleDelete() {
    if (confirm("Delete this project request?")) {
      await deleteRequest({ id: data._id as Id<"projectRequests"> });
      onClose();
    }
  }

  async function handleAddToNewsletter() {
    setSubscribing(true);
    try {
      const result = await subscribeToNewsletter({ email: data.email });
      if (result.success) {
        alert(result.newSubscription ? "Email added to newsletter subscribers!" : "Email was already subscribed.");
      } else {
        alert(result.error || "Failed to subscribe email");
      }
    } catch {
      alert("Failed to add email to newsletter");
    } finally {
      setSubscribing(false);
    }
  }

  async function handleSendReply(
    toEmail: string,
    emailSubject: string,
    message: string,
    attachments?: Array<{ filename: string; content: string }>
  ) {
    await sendEmailReply({
      to: toEmail,
      subject: emailSubject,
      message,
      recipientName: data.name,
      attachments,
    });
    await handleStatusChange("contacted");
  }

  async function handleConvert() {
    await createProjectFromRequest({ requestId: data._id as Id<"projectRequests"> });
    setIsConvertModalOpen(false);
    alert("Project request converted to project successfully!");
  }

  return (
    <div className="glass-elevated rounded-2xl p-6 space-y-6">
      <button
        onClick={onClose}
        className="lg:hidden flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to list
      </button>

      <div>
        <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Name</p>
        <p className="text-xl font-semibold text-white">{data.name}</p>
      </div>

      {/* Email Management */}
      <EmailListManager
        emails={data.emails || []}
        legacyEmail={data.email}
        recordId={data._id}
        tableName="projectRequests"
      />

      {data.businessName && (
        <div>
          <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Business Name</p>
          <p className="text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-400" />
            {data.businessName}
          </p>
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setIsReplyModalOpen(true)}
          className="px-4 py-2 rounded-lg bg-brand-light/20 text-brand-light hover:bg-brand-light/30 transition-colors border border-brand-light/50 text-sm font-medium flex items-center gap-2"
        >
          <Send className="w-4 h-4" />
          Reply via Email
        </button>
        <button
          onClick={handleAddToNewsletter}
          disabled={subscribing}
          className="px-4 py-2 rounded-lg bg-brand-dark/20 text-brand-light hover:bg-brand-dark/30 transition-colors border border-brand-dark/50 text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Mail className="w-4 h-4" />
          {subscribing ? "Adding..." : "Add to Newsletter"}
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div>
          <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Project Types</p>
          <div className="flex flex-wrap gap-1">
            {data.projectTypes.map((type: string) => (
              <span key={type} className="px-2 py-1 rounded-lg bg-brand-light/20 text-brand-light text-xs border border-brand-light/30">
                {type}
              </span>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Timeline</p>
          <p className="text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            {data.timeline}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Budget</p>
          <p className="text-white flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-green-400" />
            {data.budget}
          </p>
        </div>
      </div>

      <div>
        <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Description</p>
        <p className="text-gray-300 whitespace-pre-wrap">{data.description}</p>
      </div>

      <div>
        <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Submitted</p>
        <p className="text-white flex items-center gap-2">
          <Calendar className="w-4 h-4 text-brand-light" />
          {new Date(data.createdAt).toLocaleString()}
        </p>
      </div>

      <div>
        <p className="text-xs uppercase tracking-wider text-gray-500 mb-3">Status</p>
        <div className="flex gap-2 flex-wrap">
          {(["new", "contacted", "quoted", "accepted", "declined"] as const).map((status) => (
            <button
              key={status}
              onClick={() => handleStatusChange(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                data.status === status
                  ? STATUS_COLORS[status] + " border"
                  : "bg-white/5 text-gray-400 hover:text-white border border-white/10"
              }`}
            >
              {STATUS_LABELS[status]}
            </button>
          ))}
        </div>
      </div>

      {data.status !== "accepted" ? (
        <button
          onClick={() => setIsConvertModalOpen(true)}
          className="w-full px-4 py-3 rounded-lg bg-brand-light/10 text-brand-light hover:bg-brand-light/20 transition-all border border-brand-light/30 font-medium flex items-center justify-center gap-2"
        >
          <Briefcase className="w-4 h-4" />
          Convert to Project
        </button>
      ) : (
        <div className="w-full px-4 py-3 rounded-lg bg-green-500/10 text-green-400 border border-green-500/30 font-medium flex items-center justify-center gap-2">
          <Briefcase className="w-4 h-4" />
          Converted to Project
        </div>
      )}

      <button
        onClick={handleDelete}
        className="w-full px-4 py-3 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all border border-red-500/30 font-medium flex items-center justify-center gap-2"
      >
        <Trash2 className="w-4 h-4" />
        Delete Request
      </button>

      {/* Email Reply Modal */}
      <EmailReplyModal
        isOpen={isReplyModalOpen}
        onClose={() => setIsReplyModalOpen(false)}
        recipientEmail={data.email}
        availableEmails={data.emails}
        recipientName={data.name}
        subject={`Re: Your Project Request - ${data.projectTypes.join(", ")}`}
        onSend={handleSendReply}
      />

      {/* Convert to Project Modal */}
      {isConvertModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 rounded-2xl p-6 max-w-xl w-full border border-white/10"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Convert to Project</h2>
              <button onClick={() => setIsConvertModalOpen(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <span className="text-gray-400 text-2xl">&times;</span>
              </button>
            </div>

            <div className="mb-6 p-4 rounded-lg bg-white/5 border border-white/10 space-y-2">
              <div>
                <p className="text-sm text-gray-400">Client:</p>
                <p className="text-white font-semibold">{data.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Project Type:</p>
                <p className="text-white">{data.projectTypes.join(", ")}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Budget:</p>
                <p className="text-white">{data.budget}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Timeline:</p>
                <p className="text-white">{data.timeline}</p>
              </div>
            </div>

            <p className="text-gray-300 mb-6">
              This will create a new project with all the details from this request. The request status will be updated to &ldquo;Accepted&rdquo;.
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsConvertModalOpen(false)}
                className="flex-1 px-4 py-3 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 transition-all border border-white/10 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConvert}
                className="flex-1 px-4 py-3 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-all font-medium"
              >
                Convert to Project
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
