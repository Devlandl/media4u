"use client";

import { motion } from "motion/react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { Lock, Eye, EyeOff, Copy, Check, Save, ArrowLeft } from "lucide-react";

export default function ProjectVaultPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.projectId as Id<"projects">;

  const project = useQuery(api.projects.getProjectById, { id: projectId });
  const updateVault = useMutation(api.projects.updateIntegrationVault);

  const [isSaving, setIsSaving] = useState(false);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Form state
  const [vault, setVault] = useState({
    emailProvider: "",
    emailApiKey: "",
    emailFromAddress: "",
    googleAnalyticsId: "",
    googleTagManagerId: "",
    facebookPixelId: "",
    webhookUrl: "",
    webhookSecret: "",
    customApiKey1Label: "",
    customApiKey1Value: "",
    customApiKey2Label: "",
    customApiKey2Value: "",
    customApiKey3Label: "",
    customApiKey3Value: "",
    stripePublishableKey: "",
    stripeSecretKey: "",
    billingPortalUrl: "",
    billingPortalName: "",
    customerPortalUrl: "",
    notes: "",
  });

  // Load existing vault data
  useEffect(() => {
    if (project?.integrationVault) {
      setVault({
        emailProvider: project.integrationVault.emailProvider || "",
        emailApiKey: project.integrationVault.emailApiKey || "",
        emailFromAddress: project.integrationVault.emailFromAddress || "",
        googleAnalyticsId: project.integrationVault.googleAnalyticsId || "",
        googleTagManagerId: project.integrationVault.googleTagManagerId || "",
        facebookPixelId: project.integrationVault.facebookPixelId || "",
        webhookUrl: project.integrationVault.webhookUrl || "",
        webhookSecret: project.integrationVault.webhookSecret || "",
        customApiKey1Label: project.integrationVault.customApiKey1Label || "",
        customApiKey1Value: project.integrationVault.customApiKey1Value || "",
        customApiKey2Label: project.integrationVault.customApiKey2Label || "",
        customApiKey2Value: project.integrationVault.customApiKey2Value || "",
        customApiKey3Label: project.integrationVault.customApiKey3Label || "",
        customApiKey3Value: project.integrationVault.customApiKey3Value || "",
        stripePublishableKey: project.integrationVault.stripePublishableKey || "",
        stripeSecretKey: project.integrationVault.stripeSecretKey || "",
        billingPortalUrl: project.integrationVault.billingPortalUrl || "",
        billingPortalName: project.integrationVault.billingPortalName || "",
        customerPortalUrl: project.integrationVault.customerPortalUrl || "",
        notes: project.integrationVault.notes || "",
      });
    }
  }, [project]);

  function toggleSecret(field: string) {
    setShowSecrets((prev) => ({ ...prev, [field]: !prev[field] }));
  }

  async function copyToClipboard(field: string, value: string) {
    await navigator.clipboard.writeText(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      await updateVault({
        projectId,
        integrationVault: vault,
      });
      alert("Integration vault saved successfully!");
    } catch (error) {
      console.error("Failed to save vault:", error);
      alert("Failed to save vault. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-zinc-800 border-t-white animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading vault...</p>
        </div>
      </div>
    );
  }

  const SecretField = ({ label, field, value }: { label: string; field: string; value: string }) => (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
      <div className="flex gap-2">
        <input
          type={showSecrets[field] ? "text" : "password"}
          value={value}
          onChange={(e) => setVault({ ...vault, [field]: e.target.value })}
          className="flex-1 min-w-0 px-4 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600"
          placeholder={`Enter ${label.toLowerCase()}`}
        />
        <button
          onClick={() => toggleSecret(field)}
          className="flex-shrink-0 p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 transition-colors"
          title={showSecrets[field] ? "Hide" : "Show"}
        >
          {showSecrets[field] ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
        </button>
        {value && (
          <button
            onClick={() => copyToClipboard(field, value)}
            className="flex-shrink-0 p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 transition-colors"
            title="Copy to clipboard"
          >
            {copiedField === field ? (
              <Check className="w-5 h-5 text-green-400" />
            ) : (
              <Copy className="w-5 h-5 text-gray-400" />
            )}
          </button>
        )}
      </div>
    </div>
  );

  const TextField = ({ label, field, value, placeholder }: { label: string; field: string; value: string; placeholder?: string }) => (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => setVault({ ...vault, [field]: e.target.value })}
        className="w-full px-4 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600"
        placeholder={placeholder || `Enter ${label.toLowerCase()}`}
      />
    </div>
  );

  return (
    <div>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div>
          <button
            onClick={() => router.push("/portal/projects")}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Projects
          </button>
          <h1 className="text-xl lg:text-2xl font-semibold mb-2 flex items-center gap-3">
            <Lock className="w-6 h-6 lg:w-7 lg:h-7 text-zinc-400" />
            Integration Vault
          </h1>
          <p className="text-gray-400">
            Securely store your API keys and integration credentials for {project.projectType}
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full lg:w-auto px-6 py-3 bg-white text-zinc-950 hover:bg-zinc-200 font-medium rounded-lg transition-opacity flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-5 h-5" />
          {isSaving ? "Saving..." : "Save Vault"}
        </button>
      </motion.div>

      {/* Warning */}
      <div className="mb-4 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm">
        <p className="font-medium mb-1">Security Notice</p>
        <p className="text-amber-400/80">
          All credentials are stored securely. Never share your secret keys publicly or with untrusted parties.
        </p>
      </div>

      {/* Help Notice */}
      <div className="mb-6 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm">
        <p className="font-medium mb-1">What goes here?</p>
        <p className="text-blue-400/80">
          This page is for <strong>developer API keys</strong> - not your personal login passwords.
          If you don&apos;t have these yet, don&apos;t worry! We&apos;ll help you set them up.
          Leave any section blank if you&apos;re unsure.
        </p>
      </div>

      {/* Vault Sections */}
      <div className="space-y-6">
        {/* Email Provider */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 lg:p-6"
        >
          <h2 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
            Email Provider
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            This is for email sending services (like Resend or SendGrid) - NOT your personal email login.
            If you don&apos;t have an email service set up yet, leave this blank.
          </p>
          <div className="grid gap-4">
            <TextField label="Provider" field="emailProvider" value={vault.emailProvider} placeholder="e.g., Resend, SendGrid, Mailgun" />
            <SecretField label="API Key" field="emailApiKey" value={vault.emailApiKey} />
            <TextField label="From Address" field="emailFromAddress" value={vault.emailFromAddress} placeholder="noreply@yourdomain.com" />
          </div>
        </motion.div>

        {/* Analytics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 lg:p-6"
        >
          <h2 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
            Analytics
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <TextField label="Google Analytics ID" field="googleAnalyticsId" value={vault.googleAnalyticsId} placeholder="G-XXXXXXXXXX" />
            <TextField label="Google Tag Manager ID" field="googleTagManagerId" value={vault.googleTagManagerId} placeholder="GTM-XXXXXXX" />
            <TextField label="Facebook Pixel ID" field="facebookPixelId" value={vault.facebookPixelId} placeholder="123456789012345" />
          </div>
        </motion.div>

        {/* Webhooks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 lg:p-6"
        >
          <h2 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
            Webhooks (Advanced)
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            For connecting external services. Most clients can skip this - we&apos;ll set it up for you if needed.
          </p>
          <div className="grid gap-4">
            <TextField label="Webhook URL" field="webhookUrl" value={vault.webhookUrl} placeholder="https://your-site.com/api/webhook" />
            <SecretField label="Webhook Secret" field="webhookSecret" value={vault.webhookSecret} />
          </div>
        </motion.div>

        {/* Billing Portal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 lg:p-6"
        >
          <h2 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
            Billing / Customer Portal
          </h2>
          <p className="text-sm text-gray-500 mb-2">
            If you use a billing service like <strong>PestPac, WorkWave, ServiceTitan, Jobber</strong>, etc. - paste the links below so we can add &quot;Pay My Bill&quot; and &quot;Customer Portal&quot; buttons to your website.
          </p>
          <div className="mb-4 p-3 rounded-lg bg-zinc-800/50 border border-zinc-700 text-sm text-gray-400 space-y-2">
            <p className="font-medium text-gray-300">How to find your portal links:</p>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>PestPac/WorkWave:</strong> Log in to your PestPac account &gt; Go to Settings &gt; Customer Portal &gt; Copy the &quot;Portal URL&quot; (looks like: https://app.pestpac.com/portal/yourcompany)</li>
              <li><strong>ServiceTitan:</strong> Settings &gt; Online Booking &gt; Copy the booking/payment page URL</li>
              <li><strong>Jobber:</strong> Settings &gt; Client Hub &gt; Copy your Client Hub URL</li>
              <li><strong>Other:</strong> Look for &quot;Customer Portal&quot; or &quot;Online Payments&quot; in your software settings, or ask your software provider for the link</li>
            </ul>
            <p className="text-gray-500 italic">Not sure? Just type the name of your billing software in the notes and we&apos;ll help you find it.</p>
          </div>
          <div className="grid gap-4">
            <TextField label="Billing Software Name" field="billingPortalName" value={vault.billingPortalName} placeholder="e.g., PestPac, WorkWave, ServiceTitan, Jobber" />
            <TextField label="Pay My Bill URL" field="billingPortalUrl" value={vault.billingPortalUrl} placeholder="https://app.pestpac.com/portal/yourcompany" />
            <TextField label="Customer Portal URL" field="customerPortalUrl" value={vault.customerPortalUrl} placeholder="https://app.pestpac.com/portal/yourcompany/login" />
          </div>
        </motion.div>

        {/* Stripe */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 lg:p-6"
        >
          <h2 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
            Stripe (Online Payments)
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            For accepting payments on your website. If you don&apos;t have a Stripe account yet, visit{" "}
            <a href="https://stripe.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">stripe.com</a>{" "}
            to create one, or leave this blank and we&apos;ll help you set it up.
          </p>
          <div className="grid gap-4">
            <TextField label="Publishable Key" field="stripePublishableKey" value={vault.stripePublishableKey} placeholder="pk_test_..." />
            <SecretField label="Secret Key" field="stripeSecretKey" value={vault.stripeSecretKey} />
          </div>
        </motion.div>

        {/* Custom API Keys */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 lg:p-6"
        >
          <h2 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
            Custom API Keys
          </h2>
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <TextField label="Key 1 Label" field="customApiKey1Label" value={vault.customApiKey1Label} placeholder="e.g., OpenAI API" />
              <SecretField label="Key 1 Value" field="customApiKey1Value" value={vault.customApiKey1Value} />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <TextField label="Key 2 Label" field="customApiKey2Label" value={vault.customApiKey2Label} placeholder="e.g., AWS Access Key" />
              <SecretField label="Key 2 Value" field="customApiKey2Value" value={vault.customApiKey2Value} />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <TextField label="Key 3 Label" field="customApiKey3Label" value={vault.customApiKey3Label} placeholder="e.g., API Service" />
              <SecretField label="Key 3 Value" field="customApiKey3Value" value={vault.customApiKey3Value} />
            </div>
          </div>
        </motion.div>

        {/* Notes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 lg:p-6"
        >
          <h2 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
            Notes
          </h2>
          <textarea
            value={vault.notes}
            onChange={(e) => setVault({ ...vault, notes: e.target.value })}
            rows={4}
            className="w-full px-4 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600 resize-none"
            placeholder="Add any additional integration notes or documentation links..."
          />
        </motion.div>
      </div>

      {/* Save Button (Bottom) */}
      <div className="mt-8 flex lg:justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full lg:w-auto px-8 py-4 bg-white text-zinc-950 hover:bg-zinc-200 font-medium rounded-lg transition-opacity flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-base lg:text-lg"
        >
          <Save className="w-5 h-5" />
          {isSaving ? "Saving..." : "Save Vault"}
        </button>
      </div>
    </div>
  );
}
