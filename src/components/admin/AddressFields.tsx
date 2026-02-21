"use client";

import { MapPin } from "lucide-react";

type AddressType = {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
};

type AddressFieldsProps = {
  address: AddressType | undefined;
  onChange: (address: AddressType) => void;
  disabled?: boolean;
};

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
];

export default function AddressFields({ address, onChange, disabled }: AddressFieldsProps) {
  const currentAddress = address || {};

  const handleChange = (field: keyof AddressType, value: string) => {
    onChange({
      ...currentAddress,
      [field]: value || undefined,
    });
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-white flex items-center gap-2">
        <MapPin className="w-4 h-4 text-brand-light" />
        Address
      </label>

      <div className="space-y-3">
        {/* Street Address */}
        <input
          type="text"
          value={currentAddress.street || ""}
          onChange={(e) => handleChange("street", e.target.value)}
          disabled={disabled}
          placeholder="Street Address"
          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-brand-light/50 disabled:opacity-50 disabled:cursor-not-allowed"
        />

        {/* City, State, ZIP */}
        <div className="grid grid-cols-6 gap-2">
          <input
            type="text"
            value={currentAddress.city || ""}
            onChange={(e) => handleChange("city", e.target.value)}
            disabled={disabled}
            placeholder="City"
            className="col-span-3 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-brand-light/50 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <select
            value={currentAddress.state || ""}
            onChange={(e) => handleChange("state", e.target.value)}
            disabled={disabled}
            className="col-span-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-brand-light/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">State</option>
            {US_STATES.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={currentAddress.zip || ""}
            onChange={(e) => handleChange("zip", e.target.value)}
            disabled={disabled}
            placeholder="ZIP"
            maxLength={10}
            className="col-span-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-brand-light/50 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Country */}
        <input
          type="text"
          value={currentAddress.country || "USA"}
          onChange={(e) => handleChange("country", e.target.value)}
          disabled={disabled}
          placeholder="Country"
          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-brand-light/50 disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>
    </div>
  );
}
