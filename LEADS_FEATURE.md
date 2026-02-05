# Lead Management System - Implementation Plan

**Status:** Ready to implement
**Date Created:** 2026-02-05
**Estimated Time:** 30-45 minutes

---

## Overview

Add a **Lead Management** section to the admin dashboard for tracking and emailing potential customers.

## Why This Feature?

- You already have the email infrastructure set up ✅
- Cool email template is ready to use ✅
- Can manually add leads and reach out to them
- Track lead status and conversations
- Similar to Contact Forms/Project Requests but for **outbound sales**

---

## What We'll Build

### 1. **Lead Database** (Convex)
- `leads` table with fields:
  - `name` - Contact name
  - `email` - Email address
  - `company` - Company name (optional)
  - `phone` - Phone number (optional)
  - `source` - Where they came from (referral, website, etc.)
  - `status` - New, Contacted, Qualified, Converted, Lost
  - `notes` - Any additional details
  - `createdAt` - When lead was added
  - `lastContactedAt` - Last time you reached out

### 2. **Admin Page** (`/admin/leads`)
- **Lead List View**
  - Grid layout showing all leads
  - Status badges (color-coded)
  - Search by name/email/company
  - Filter by status
  - Sort by date added

- **Add Lead Form**
  - Modal or separate section
  - Form fields for all lead info
  - Quick "Add Lead" button

- **Lead Details View**
  - Click a lead to see full details
  - Edit lead information
  - View contact history
  - **Reply/Email button** (reuses existing EmailReplyModal)
  - Delete lead option

### 3. **Email Integration**
- Reuse the existing `EmailReplyModal` component
- Reuse the `sendEmailReply` Convex action
- Professional branded emails (already built!)
- Auto-update `lastContactedAt` when email sent
- Auto-update status to "Contacted"

### 4. **Navigation**
- Add "Leads" link to admin sidebar
- Icon: Users or Target icon
- Position: After "Project Requests"

---

## Technical Implementation

### Step 1: Create Convex Schema & Functions (5 min)
```typescript
// convex/schema.ts
leads: defineTable({
  name: v.string(),
  email: v.string(),
  company: v.optional(v.string()),
  phone: v.optional(v.string()),
  source: v.string(),
  status: v.union(
    v.literal("new"),
    v.literal("contacted"),
    v.literal("qualified"),
    v.literal("converted"),
    v.literal("lost")
  ),
  notes: v.string(),
  createdAt: v.number(),
  lastContactedAt: v.optional(v.number()),
}).index("by_status", ["status"])
  .index("by_email", ["email"]),
```

### Step 2: Create Convex Functions (10 min)
- `convex/leads.ts`:
  - `getAllLeads` (query)
  - `getLeadById` (query)
  - `createLead` (mutation)
  - `updateLead` (mutation)
  - `deleteLead` (mutation)
  - `updateLastContacted` (mutation)

### Step 3: Create Admin Page (15 min)
- `src/app/admin/leads/page.tsx`
- Master-detail layout (like contacts/project requests)
- Reuse existing UI patterns
- Add search bar
- Add status filters

### Step 4: Add to Navigation (5 min)
- Update `src/components/layout/admin-sidebar.tsx`
- Add "Leads" link with Users icon

### Step 5: Testing (5 min)
- Add a test lead
- Send an email to the lead
- Verify status updates
- Check search/filters work

---

## Features Included

✅ **Add leads manually** - Simple form to capture lead info
✅ **Send emails** - Same professional template as contact replies
✅ **Track status** - New → Contacted → Qualified → Converted/Lost
✅ **Search & filter** - Find leads by name, email, company, or status
✅ **Lead details** - Full view with edit and delete options
✅ **Email history tracking** - See when you last contacted them
✅ **Status badges** - Color-coded for quick scanning

---

## Benefits

- **Outbound sales** - Reach out to potential customers
- **Lead tracking** - Never lose track of a conversation
- **Professional emails** - Branded, beautiful emails every time
- **Quick access** - All in the admin dashboard
- **Reuses existing code** - Fast to implement, minimal new code

---

## Example Use Cases

1. **Trade show contacts** - Add people you met, follow up later
2. **Referrals** - Someone recommends you, add them as a lead
3. **Cold outreach** - Research companies, add decision-makers
4. **Follow-ups** - Track who you've contacted and when
5. **Pipeline management** - Move leads through your sales process

---

## Next Steps

When you're ready tomorrow:
1. Open this file (`LEADS_FEATURE.md`)
2. Tell me you want to build the Lead Management system
3. I'll implement it step-by-step (30-45 minutes total)
4. You'll have a complete lead management system!

---

**Current Status:** All email infrastructure is ready. Email templates are beautiful and working. Just need to build the leads database and admin page!

🚀 Ready to implement when you are!
