"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export function ApplyForm() {
  const [formData, setFormData] = useState({
    name: "",
    businessName: "",
    email: "",
    phone: "",
    location: "",
    industry: "",
    website: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!formData.name || !formData.businessName || !formData.email || !formData.industry) {
        setError("Please fill in all required fields");
        setIsSubmitting(false);
        return;
      }

      // Create Stripe checkout session for $50 deposit
      const response = await fetch("/api/stripe/create-deposit-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Error submitting application:", err);
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
          Your Name <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-light/50 focus:border-brand-light transition-all"
          placeholder="John Smith"
        />
      </div>

      {/* Business Name */}
      <div>
        <label htmlFor="businessName" className="block text-sm font-medium text-white mb-2">
          Business Name <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          id="businessName"
          name="businessName"
          value={formData.businessName}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-light/50 focus:border-brand-light transition-all"
          placeholder="Smith Door Company"
        />
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
          Email <span className="text-red-400">*</span>
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-light/50 focus:border-brand-light transition-all"
          placeholder="john@smithdoors.com"
        />
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-white mb-2">
          Phone Number
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-light/50 focus:border-brand-light transition-all"
          placeholder="(555) 123-4567"
        />
      </div>

      {/* Location */}
      <div>
        <label htmlFor="location" className="block text-sm font-medium text-white mb-2">
          Location
        </label>
        <input
          type="text"
          id="location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-light/50 focus:border-brand-light transition-all"
          placeholder="Phoenix, AZ"
        />
      </div>

      {/* Industry */}
      <div>
        <label htmlFor="industry" className="block text-sm font-medium text-white mb-2">
          Industry <span className="text-red-400">*</span>
        </label>
        <select
          id="industry"
          name="industry"
          value={formData.industry}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-light/50 focus:border-brand-light transition-all"
        >
          <option value="" className="bg-gray-900">
            Select your industry
          </option>
          <option value="Door Company" className="bg-gray-900">
            Door Company
          </option>
          <option value="Pool Service" className="bg-gray-900">
            Pool Service
          </option>
          <option value="HVAC" className="bg-gray-900">
            HVAC
          </option>
          <option value="Pest Control" className="bg-gray-900">
            Pest Control
          </option>
          <option value="Plumbing" className="bg-gray-900">
            Plumbing
          </option>
          <option value="Roofing" className="bg-gray-900">
            Roofing
          </option>
          <option value="Auto Glass" className="bg-gray-900">
            Auto Glass
          </option>
          <option value="Landscaping" className="bg-gray-900">
            Landscaping
          </option>
          <option value="Barbershop" className="bg-gray-900">
            Barbershop
          </option>
          <option value="Law Firm" className="bg-gray-900">
            Law Firm
          </option>
          <option value="Other" className="bg-gray-900">
            Other
          </option>
        </select>
      </div>

      {/* Current Website */}
      <div>
        <label htmlFor="website" className="block text-sm font-medium text-white mb-2">
          Current Website (if any)
        </label>
        <input
          type="text"
          id="website"
          name="website"
          value={formData.website}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-light/50 focus:border-brand-light transition-all"
          placeholder="example.com or leave blank"
        />
      </div>

      {/* Additional Info */}
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-white mb-2">
          Anything else we should know?
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          rows={4}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-light/50 focus:border-brand-light transition-all resize-none"
          placeholder="Tell us a bit about your business goals..."
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-gradient-to-r from-brand-light to-brand-dark hover:opacity-90 transition-opacity text-white font-semibold py-6 text-lg"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Processing...
          </>
        ) : (
          "Reserve Your Spot - $50 Deposit"
        )}
      </Button>

      <p className="text-xs text-gray-500 text-center">
        $50 deposit required to reserve your spot. Fully refundable if you don&apos;t love the finished site.
      </p>
    </form>
  );
}
