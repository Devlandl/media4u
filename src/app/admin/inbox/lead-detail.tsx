"use client";

import { useState } from "react";
import { useMutation, useAction } from "convex/react";
import { api } from "@convex/_generated/api";
import { Doc, Id } from "@convex/_generated/dataModel";
import { motion } from "motion/react";
import {
  Mail, Phone, Building2, FileText, Calendar,
  Trash2, Briefcase, ArrowLeft, X,
} from "lucide-react";
import { EmailReplyModal } from "@/components/admin/EmailReplyModal";

type LeadStatus = "new" | "contacted" | "qualified" | "converted" | "lost";

const STATUS_COLORS: Record<LeadStatus, string> = {
  new: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  contacted: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  qualified: "bg-brand-dark/20 text-brand-light border-brand-dark/30",
  converted: "bg-green-500/20 text-green-400 border-green-500/30",
  lost: "bg-red-500/20 text-red-400 border-red-500/30",
};

const STATUS_LABELS: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  converted: "Converted",
  lost: "Lost",
};

type LeadDetailProps = {
  data: Doc<"leads">;
  onClose: () => void;
};

export function LeadDetail({ data, onClose }: LeadDetailProps) {
  const updateLead = useMutation(api.leads.updateLead);
  const deleteLead = useMutation(api.leads.deleteLead);
  const updateLastContacted = useMutation(api.leads.updateLastContacted);
  const sendEmailReply = useAction(api.emailReplies.sendEmailReply);
  const createProjectFromLead = useMutation(api.projects.createProjectFromLead);
  const subscribeToNewsletter = useMutation(api.newsletter.subscribeToNewsletter);

  const [subscribing, setSubscribing] = useState(false);
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [convertData, setConvertData] = useState({
    projectType: "",
    description: "",
    requirements: "",
    budget: "",
    timeline: "",
  });

  async function handleStatusChange(status: LeadStatus) {
    await updateLead({ id: data._id as Id<"leads">, status });
  }

  async function handleDelete() {
    if (confirm("Delete this lead?")) {
      await deleteLead({ id: data._id as Id<"leads"> });
      onClose();
    }
  }

  async function handleSendReply(message: string, attachments?: Array<{ filename: string; content: string }>) {
    await sendEmailReply({
      to: data.email,
      subject: "Following up - Media4U",
      message,
      recipientName: data.name,
      attachments,
    });
    await updateLastContacted({ id: data._id as Id<"leads"> });
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

  async function handleConvert(e: React.FormEvent) {
    e.preventDefault();
    if (!convertData.projectType || !convertData.description) {
      alert("Please fill in Project Type and Description");
      return;
    }

    await createProjectFromLead({
      leadId: data._id as Id<"leads">,
      projectType: convertData.projectType,
      description: convertData.description,
      requirements: convertData.requirements || undefined,
      budget: convertData.budget || undefined,
      timeline: convertData.timeline || undefined,
    });

    setConvertData({ projectType: "", description: "", requirements: "", budget: "", timeline: "" });
    setIsConvertModalOpen(false);
    alert("Lead converted to project successfully!");
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

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Email</p>
          <a href={`mailto:${data.email}`} className="text-brand-light hover:text-brand-light flex items-center gap-2">
            <Mail className="w-4 h-4" />
            {data.email}
          </a>
        </div>
        {data.phone && (
          <div>
            <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Phone</p>
            <a href={`tel:${data.phone}`} className="text-brand-light hover:text-brand-light flex items-center gap-2">
              <Phone className="w-4 h-4" />
              {data.phone}
            </a>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setIsReplyModalOpen(true)}
          className="px-4 py-2 rounded-lg bg-brand-light/20 text-brand-light hover:bg-brand-light/30 transition-colors border border-brand-light/50 text-sm font-medium flex items-center gap-2"
        >
          <Mail className="w-4 h-4" />
          Send Email
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

      <div className="grid md:grid-cols-2 gap-6">
        {data.company && (
          <div>
            <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Company</p>
            <p className="text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-400" />
              {data.company}
            </p>
          </div>
        )}
        <div>
          <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Source</p>
          <p className="text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-400" />
            {data.source}
          </p>
        </div>
      </div>

      {data.notes && (
        <div>
          <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Notes</p>
          <p className="text-gray-300 whitespace-pre-wrap">{data.notes}</p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Added</p>
          <p className="text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-brand-light" />
            {new Date(data.createdAt).toLocaleString()}
          </p>
        </div>
        {data.lastContactedAt && (
          <div>
            <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Last Contacted</p>
            <p className="text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-green-400" />
              {new Date(data.lastContactedAt).toLocaleString()}
            </p>
          </div>
        )}
      </div>

      <div>
        <p className="text-xs uppercase tracking-wider text-gray-500 mb-3">Status</p>
        <div className="flex flex-wrap gap-2">
          {(["new", "contacted", "qualified", "converted", "lost"] as const).map((status) => (
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

      {data.status !== "converted" ? (
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
        Delete Lead
      </button>

      {/* Email Reply Modal */}
      <EmailReplyModal
        isOpen={isReplyModalOpen}
        onClose={() => setIsReplyModalOpen(false)}
        recipientEmail={data.email}
        recipientName={data.name}
        subject="Following up - Media4U"
        onSend={handleSendReply}
      />

      {/* Convert to Project Modal */}
      {isConvertModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full border border-white/10"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Convert Lead to Project</h2>
              <button onClick={() => setIsConvertModalOpen(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="mb-6 p-4 rounded-lg bg-white/5 border border-white/10">
              <p className="text-sm text-gray-400 mb-2">Converting lead:</p>
              <p className="text-white font-semibold">{data.name}</p>
              <p className="text-gray-400 text-sm">{data.email}</p>
            </div>

            <form onSubmit={handleConvert} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Project Type <span className="text-red-400">*</span>
                </label>
                <select
                  value={convertData.projectType}
                  onChange={(e) => setConvertData({ ...convertData, projectType: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-brand-light/50 [&>option]:bg-gray-800 [&>option]:text-white"
                  required
                >
                  <option value="">Select project type...</option>
                  <option value="VR Website">VR Website</option>
                  <option value="Standard Website">Standard Website</option>
                  <option value="E-commerce">E-commerce</option>
                  <option value="Portfolio">Portfolio</option>
                  <option value="Landing Page">Landing Page</option>
                  <option value="Web App">Web App</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={convertData.description}
                  onChange={(e) => setConvertData({ ...convertData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-brand-light/50 resize-none"
                  placeholder="Brief description of the project..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Requirements</label>
                <textarea
                  value={convertData.requirements}
                  onChange={(e) => setConvertData({ ...convertData, requirements: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-brand-light/50 resize-none"
                  placeholder="Specific features, pages, functionality needed..."
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Budget</label>
                  <input
                    type="text"
                    value={convertData.budget}
                    onChange={(e) => setConvertData({ ...convertData, budget: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-brand-light/50"
                    placeholder="e.g., $5,000 - $10,000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Timeline</label>
                  <input
                    type="text"
                    value={convertData.timeline}
                    onChange={(e) => setConvertData({ ...convertData, timeline: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-brand-light/50"
                    placeholder="e.g., 4-6 weeks"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsConvertModalOpen(false)}
                  className="flex-1 px-4 py-3 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 transition-all border border-white/10 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-all font-medium"
                >
                  Convert to Project
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
