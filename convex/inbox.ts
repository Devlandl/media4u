import { query } from "./_generated/server";
import { Doc } from "./_generated/dataModel";

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

function mapContactStatus(status: string): UnifiedStatus {
  if (status === "new") return "new";
  if (status === "read") return "in_progress";
  return "closed"; // replied
}

function mapRequestStatus(status: string): UnifiedStatus {
  if (status === "new") return "new";
  if (status === "contacted" || status === "quoted") return "in_progress";
  if (status === "accepted") return "converted";
  return "closed"; // declined
}

function mapQuoteStatus(status: string): UnifiedStatus {
  if (status === "new") return "new";
  if (status === "contacted" || status === "quoted") return "in_progress";
  return "closed"; // closed
}

function mapLeadStatus(status: string): UnifiedStatus {
  if (status === "new") return "new";
  if (status === "contacted" || status === "qualified") return "in_progress";
  if (status === "converted") return "converted";
  return "closed"; // lost
}

export const getInboxItems = query({
  args: {},
  handler: async (ctx): Promise<InboxItem[]> => {
    const [contacts, requests, quotes, leads] = await Promise.all([
      ctx.db.query("contactSubmissions").order("desc").collect(),
      ctx.db.query("projectRequests").order("desc").collect(),
      ctx.db.query("quoteRequests").order("desc").collect(),
      ctx.db.query("leads").order("desc").collect(),
    ]);

    const items: InboxItem[] = [
      ...contacts.map((c) => ({
        id: c._id,
        source: "contact" as const,
        name: c.name,
        email: c.email,
        unifiedStatus: mapContactStatus(c.status),
        createdAt: c.createdAt,
        sourceData: c,
      })),
      ...requests.map((r) => ({
        id: r._id,
        source: "request" as const,
        name: r.name,
        email: r.email,
        unifiedStatus: mapRequestStatus(r.status),
        createdAt: r.createdAt,
        sourceData: r,
      })),
      ...quotes.map((q) => ({
        id: q._id,
        source: "quote" as const,
        name: q.name,
        email: q.email ?? "",
        unifiedStatus: mapQuoteStatus(q.status),
        createdAt: q.createdAt,
        sourceData: q,
      })),
      ...leads.map((l) => ({
        id: l._id,
        source: "lead" as const,
        name: l.name,
        email: l.email,
        unifiedStatus: mapLeadStatus(l.status),
        createdAt: l.createdAt,
        sourceData: l,
      })),
    ];

    items.sort((a, b) => b.createdAt - a.createdAt);
    return items;
  },
});

export const getInboxNewCount = query({
  args: {},
  handler: async (ctx): Promise<number> => {
    const [contacts, requests, quotes, leads] = await Promise.all([
      ctx.db.query("contactSubmissions").collect(),
      ctx.db.query("projectRequests").collect(),
      ctx.db.query("quoteRequests").collect(),
      ctx.db.query("leads").collect(),
    ]);

    const newContacts = contacts.filter((c) => c.status === "new").length;
    const newRequests = requests.filter((r) => r.status === "new").length;
    const newQuotes = quotes.filter((q) => q.status === "new").length;
    const newLeads = leads.filter((l) => l.status === "new").length;

    return newContacts + newRequests + newQuotes + newLeads;
  },
});
