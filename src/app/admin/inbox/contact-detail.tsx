"use client";

import { useState } from "react";
import { useMutation, useAction } from "convex/react";
import { api } from "@convex/_generated/api";
import { Doc, Id } from "@convex/_generated/dataModel";
import { Mail, Briefcase, Calendar, Trash2, FolderPlus, ArrowLeft } from "lucide-react";
import { EmailReplyModal } from "@/components/admin/EmailReplyModal";

type ContactStatus = "new" | "read" | "replied";

const STATUS_COLORS: Record<ContactStatus, string> = {
  new: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  read: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  replied: "bg-green-500/20 text-green-400 border-green-500/30",
};

const STATUS_LABELS: Record<ContactStatus, string> = {
  new: "New",
  read: "Read",
  replied: "Replied",
};

type ContactDetailProps = {
  data: Doc<"contactSubmissions">;
  onClose: () => void;
};

export function ContactDetail({ data, onClose }: ContactDetailProps) {
  const updateStatus = useMutation(api.contactSubmissions.updateContactStatus);
  const deleteSubmission = useMutation(api.contactSubmissions.deleteContactSubmission);
  const sendEmailReply = useAction(api.emailReplies.sendEmailReply);
  const convertToProject = useMutation(api.contactSubmissions.createProjectFromContact);
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);

  async function handleStatusChange(status: ContactStatus) {
    await updateStatus({ id: data._id as Id<"contactSubmissions">, status });
  }

  async function handleDelete() {
    if (confirm("Delete this submission?")) {
      await deleteSubmission({ id: data._id as Id<"contactSubmissions"> });
      onClose();
    }
  }

  async function handleSendReply(message: string, attachments?: Array<{ filename: string; content: string }>) {
    await sendEmailReply({
      to: data.email,
      subject: `Re: ${data.service} Inquiry`,
      message,
      recipientName: data.name,
      attachments,
    });
    await handleStatusChange("replied");
  }

  async function handleConvert() {
    if (confirm("Convert this contact submission to a project?")) {
      await convertToProject({ contactId: data._id as Id<"contactSubmissions"> });
      onClose();
      alert("Project created successfully!");
    }
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
        <div className="flex items-end gap-2">
          <button
            onClick={() => setIsReplyModalOpen(true)}
            className="px-4 py-2 rounded-lg bg-brand-light/20 text-brand-light hover:bg-brand-light/30 transition-colors border border-brand-light/50 text-sm font-medium flex items-center gap-2"
          >
            <Mail className="w-4 h-4" />
            Reply via Email
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Service Requested</p>
          <p className="text-white flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-brand-light" />
            {data.service}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Submitted</p>
          <p className="text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-brand-light" />
            {new Date(data.createdAt).toLocaleString()}
          </p>
        </div>
      </div>

      <div>
        <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Message</p>
        <p className="text-gray-300 whitespace-pre-wrap">{data.message}</p>
      </div>

      <div>
        <p className="text-xs uppercase tracking-wider text-gray-500 mb-3">Status</p>
        <div className="flex gap-2 flex-wrap">
          {(["new", "read", "replied"] as const).map((status) => (
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

      <button
        onClick={handleConvert}
        className="w-full px-4 py-3 rounded-lg bg-brand-light/10 text-brand-light hover:bg-brand-light/20 transition-all border border-brand-light/30 font-medium flex items-center justify-center gap-2"
      >
        <FolderPlus className="w-4 h-4" />
        Convert to Project
      </button>

      <button
        onClick={handleDelete}
        className="w-full px-4 py-3 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all border border-red-500/30 font-medium flex items-center justify-center gap-2"
      >
        <Trash2 className="w-4 h-4" />
        Delete Submission
      </button>

      <EmailReplyModal
        isOpen={isReplyModalOpen}
        onClose={() => setIsReplyModalOpen(false)}
        recipientEmail={data.email}
        recipientName={data.name}
        subject={`Re: ${data.service} Inquiry`}
        onSend={handleSendReply}
      />
    </div>
  );
}
