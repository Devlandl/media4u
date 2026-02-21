"use client";

import { type ReactElement, useState } from "react";
import { motion } from "motion/react";
import { useAuth } from "@/components/AuthContext";
import { User, Mail, Lock, Edit2, Check, X, Loader2, Building2, Globe, Clock, Phone } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import Link from "next/link";
import PhoneListManager from "@/components/admin/PhoneListManager";
import AddressFields from "@/components/admin/AddressFields";

type PhoneType = {
  number: string;
  label: string;
  isPrimary: boolean;
};

type AddressType = {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
};

export default function PortalSettingsPage(): ReactElement {
  const { user, userRole } = useAuth();
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const updateUserName = useMutation(api.users.updateUserName);

  // Contact information editing
  const clientData = useQuery(api.clientManagement.getMyClientData);
  const updateMyClientInfo = useMutation(api.clientManagement.updateMyClientInfo);
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [isSavingContact, setIsSavingContact] = useState(false);
  const [contactSaveSuccess, setContactSaveSuccess] = useState(false);
  const [contactData, setContactData] = useState({
    company: "",
    website: "",
    phones: [] as PhoneType[],
    address: {} as AddressType,
    preferredContact: "" as "email" | "phone" | "text" | "",
    timezone: "",
  });

  const handleStartEdit = () => {
    setEditedName(user?.name || "");
    setIsEditingName(true);
  };

  const handleCancelEdit = () => {
    setIsEditingName(false);
    setEditedName("");
  };

  const handleSaveName = async () => {
    if (!editedName.trim() || !user?.id) return;

    setIsSaving(true);
    try {
      await updateUserName({ userId: user.id, name: editedName.trim() });
      setSaveSuccess(true);
      setIsEditingName(false);
      setTimeout(() => setSaveSuccess(false), 3000);
      // Refresh the page to show updated name
      window.location.reload();
    } catch (error) {
      console.error("Failed to update name:", error);
      alert("Failed to update name. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartContactEdit = () => {
    setContactData({
      company: clientData?.company || "",
      website: clientData?.website || "",
      phones: clientData?.phones || [],
      address: clientData?.address || {},
      preferredContact: clientData?.preferredContact || "",
      timezone: clientData?.timezone || "",
    });
    setIsEditingContact(true);
  };

  const handleCancelContactEdit = () => {
    setIsEditingContact(false);
  };

  const handleSaveContact = async () => {
    setIsSavingContact(true);
    try {
      await updateMyClientInfo({
        updates: {
          company: contactData.company || undefined,
          website: contactData.website || undefined,
          phones: contactData.phones.length > 0 ? contactData.phones : undefined,
          address: contactData.address,
          preferredContact: contactData.preferredContact || undefined,
          timezone: contactData.timezone || undefined,
        },
      });
      setContactSaveSuccess(true);
      setIsEditingContact(false);
      setTimeout(() => setContactSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to update contact information:", error);
      alert("Failed to update contact information. Please try again.");
    } finally {
      setIsSavingContact(false);
    }
  };

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-xl lg:text-2xl font-semibold mb-2">
          Account <span className="text-white">Settings</span>
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
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 lg:p-6"
        >
          <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-zinc-400" />
            Profile Information
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Full Name</label>
              {isEditingName ? (
                <div className="flex flex-wrap gap-2">
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="flex-1 min-w-0 px-4 py-3 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600"
                    placeholder="Enter your name"
                    disabled={isSaving}
                  />
                  <button
                    onClick={handleSaveName}
                    disabled={isSaving || !editedName.trim()}
                    className="px-4 py-3 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                    className="px-4 py-3 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-zinc-800/50 border border-zinc-800">
                  <span className="text-white">{user?.name}</span>
                  <button
                    onClick={handleStartEdit}
                    className="text-zinc-300 hover:text-white transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              )}
              {saveSuccess && (
                <p className="text-xs text-green-400 mt-1 flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Name updated successfully!
                </p>
              )}
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Email Address</label>
              <div className="px-4 py-3 rounded-lg bg-zinc-800/50 border border-zinc-800 text-white flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" />
                {user?.email}
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Account Type</label>
              <div className="px-4 py-3 rounded-lg bg-zinc-800/50 border border-zinc-800">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                  userRole === "admin"
                    ? "bg-violet-500/10 text-violet-400 border border-violet-500/20"
                    : userRole === "client"
                    ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                    : "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20"
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
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 lg:p-6"
        >
          <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5 text-zinc-400" />
            Security
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Password</label>
              <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-zinc-800/50 border border-zinc-800">
                <span className="text-white">••••••••••••</span>
                <Link
                  href="/reset-password"
                  className="text-zinc-300 hover:text-white text-sm font-medium transition-colors"
                >
                  Change Password
                </Link>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                You&apos;ll receive an email with reset instructions
              </p>
            </div>
          </div>
        </motion.div>

      </div>

      {/* Contact Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-6 bg-zinc-900 border border-zinc-800 rounded-xl p-4 lg:p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium flex items-center gap-2">
            <Building2 className="w-5 h-5 text-zinc-400" />
            Contact Information
          </h2>
          {!isEditingContact && (
            <button
              onClick={handleStartContactEdit}
              className="text-zinc-300 hover:text-white transition-colors flex items-center gap-2 text-sm"
            >
              <Edit2 className="w-4 h-4" />
              Edit
            </button>
          )}
        </div>

        {isEditingContact ? (
          <div className="space-y-6">
            {/* Company */}
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Company Name</label>
              <input
                type="text"
                value={contactData.company}
                onChange={(e) => setContactData({ ...contactData, company: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600"
                placeholder="Your company name"
                disabled={isSavingContact}
              />
            </div>

            {/* Website */}
            <div>
              <label className="text-sm text-gray-400 mb-2 block flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Website
              </label>
              <input
                type="url"
                value={contactData.website}
                onChange={(e) => setContactData({ ...contactData, website: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600"
                placeholder="https://example.com"
                disabled={isSavingContact}
              />
            </div>

            {/* Phone Numbers */}
            <PhoneListManager
              phones={contactData.phones}
              onChange={(phones) => setContactData({ ...contactData, phones })}
              disabled={isSavingContact}
            />

            {/* Address */}
            <AddressFields
              address={contactData.address}
              onChange={(address) => setContactData({ ...contactData, address })}
              disabled={isSavingContact}
            />

            {/* Preferred Contact & Timezone */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Preferred Contact Method
                </label>
                <select
                  value={contactData.preferredContact}
                  onChange={(e) =>
                    setContactData({
                      ...contactData,
                      preferredContact: e.target.value as "email" | "phone" | "text" | "",
                    })
                  }
                  className="w-full px-4 py-3 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-600"
                  disabled={isSavingContact}
                >
                  <option value="">Not specified</option>
                  <option value="email">Email</option>
                  <option value="phone">Phone</option>
                  <option value="text">Text</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Timezone
                </label>
                <select
                  value={contactData.timezone}
                  onChange={(e) => setContactData({ ...contactData, timezone: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-600"
                  disabled={isSavingContact}
                >
                  <option value="">Not specified</option>
                  <option value="America/New_York">Eastern</option>
                  <option value="America/Chicago">Central</option>
                  <option value="America/Denver">Mountain</option>
                  <option value="America/Los_Angeles">Pacific</option>
                  <option value="America/Phoenix">Arizona</option>
                  <option value="America/Anchorage">Alaska</option>
                  <option value="Pacific/Honolulu">Hawaii</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSaveContact}
                disabled={isSavingContact}
                className="px-6 py-3 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSavingContact ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
              <button
                onClick={handleCancelContactEdit}
                disabled={isSavingContact}
                className="px-6 py-3 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>

            {contactSaveSuccess && (
              <p className="text-sm text-green-400 flex items-center gap-2">
                <Check className="w-4 h-4" />
                Contact information updated successfully!
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Display Mode */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Company</label>
                <div className="px-4 py-3 rounded-lg bg-zinc-800/50 border border-zinc-800 text-white">
                  {clientData?.company || <span className="text-gray-500">Not set</span>}
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Website</label>
                <div className="px-4 py-3 rounded-lg bg-zinc-800/50 border border-zinc-800 text-white">
                  {clientData?.website ? (
                    <a
                      href={clientData.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-light hover:underline flex items-center gap-2"
                    >
                      <Globe className="w-4 h-4" />
                      {clientData.website}
                    </a>
                  ) : (
                    <span className="text-gray-500">Not set</span>
                  )}
                </div>
              </div>
            </div>

            {/* Phone Numbers */}
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Phone Numbers</label>
              {clientData?.phones && clientData.phones.length > 0 ? (
                <div className="space-y-2">
                  {clientData.phones.map((phone, index) => (
                    <div
                      key={index}
                      className="px-4 py-3 rounded-lg bg-zinc-800/50 border border-zinc-800 text-white flex items-center gap-2"
                    >
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{phone.number}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-brand-light/20 text-brand-light border border-brand-light/30">
                        {phone.label}
                      </span>
                      {phone.isPrimary && <span className="text-xs text-yellow-400">Primary</span>}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-3 rounded-lg bg-zinc-800/50 border border-zinc-800 text-gray-500">
                  No phone numbers added
                </div>
              )}
            </div>

            {/* Address */}
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Address</label>
              <div className="px-4 py-3 rounded-lg bg-zinc-800/50 border border-zinc-800 text-white">
                {clientData?.address?.street ? (
                  <div className="space-y-1">
                    <div>{clientData.address.street}</div>
                    <div>
                      {clientData.address.city && `${clientData.address.city}, `}
                      {clientData.address.state && `${clientData.address.state} `}
                      {clientData.address.zip}
                    </div>
                    {clientData.address.country && <div>{clientData.address.country}</div>}
                  </div>
                ) : (
                  <span className="text-gray-500">Not set</span>
                )}
              </div>
            </div>

            {/* Preferred Contact & Timezone */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Preferred Contact</label>
                <div className="px-4 py-3 rounded-lg bg-zinc-800/50 border border-zinc-800 text-white">
                  {clientData?.preferredContact || <span className="text-gray-500">Not set</span>}
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Timezone</label>
                <div className="px-4 py-3 rounded-lg bg-zinc-800/50 border border-zinc-800 text-white">
                  {clientData?.timezone
                    ? clientData.timezone
                        .replace("America/", "")
                        .replace("Pacific/", "")
                        .replace("_", " ")
                    : <span className="text-gray-500">Not set</span>}
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Support Contact Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-6 bg-zinc-900 border border-zinc-800 rounded-xl p-4 lg:p-6 text-center"
      >
        <p className="text-gray-400 text-sm mb-2">
          Need help with your account settings?
        </p>
        <a
          href="/portal/support"
          className="text-zinc-300 hover:text-white transition-colors text-sm font-medium"
        >
          Contact Support →
        </a>
      </motion.div>
    </div>
  );
}
