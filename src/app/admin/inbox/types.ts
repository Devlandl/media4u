import { Doc } from "@convex/_generated/dataModel";

export type InboxSource = "contact" | "request" | "quote" | "lead";

export type UnifiedStatus = "new" | "in_progress" | "converted" | "closed";

export type InboxItem = {
  id: string;
  source: InboxSource;
  name: string;
  email: string;
  unifiedStatus: UnifiedStatus;
  createdAt: number;
  sourceData: Doc<"contactSubmissions"> | Doc<"projectRequests"> | Doc<"quoteRequests"> | Doc<"leads">;
};

export const SOURCE_LABELS: Record<InboxSource, string> = {
  contact: "Contact",
  request: "Project",
  quote: "Quote",
  lead: "Lead",
};

export const SOURCE_COLORS: Record<InboxSource, string> = {
  contact: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  request: "bg-brand-dark/20 text-brand-light border-brand-dark/30",
  quote: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  lead: "bg-green-500/20 text-green-400 border-green-500/30",
};

export const UNIFIED_STATUS_LABELS: Record<UnifiedStatus, string> = {
  new: "New",
  in_progress: "In Progress",
  converted: "Converted",
  closed: "Closed",
};

export const UNIFIED_STATUS_COLORS: Record<UnifiedStatus, string> = {
  new: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  in_progress: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  converted: "bg-green-500/20 text-green-400 border-green-500/30",
  closed: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};
