"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { CreditCard, RefreshCw, Receipt } from "lucide-react";
import { OrdersTab } from "./orders-tab";
import { SubscriptionsTab } from "./subscriptions-tab";
import { InvoicesTab } from "./invoices-tab";

type BillingTab = "orders" | "subscriptions" | "invoices";

const TABS: Array<{ key: BillingTab; label: string; icon: typeof CreditCard }> = [
  { key: "orders", label: "Orders", icon: CreditCard },
  { key: "subscriptions", label: "Subscriptions", icon: RefreshCw },
  { key: "invoices", label: "Invoices", icon: Receipt },
];

export default function AdminBillingPage() {
  const [activeTab, setActiveTab] = useState<BillingTab>("orders");

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl sm:text-4xl font-display font-bold mb-2">Billing</h1>
        <p className="text-gray-400">View and manage orders, subscriptions, and invoices</p>
      </motion.div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 border-b border-white/10 pb-3">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.key
                ? "bg-brand-light/20 text-brand-light border border-brand-light/50"
                : "bg-white/5 text-gray-400 hover:text-white border border-white/10"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "orders" && <OrdersTab />}
      {activeTab === "subscriptions" && <SubscriptionsTab />}
      {activeTab === "invoices" && <InvoicesTab />}
    </div>
  );
}
