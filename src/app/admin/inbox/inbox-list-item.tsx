import { motion } from "motion/react";
import {
  InboxItem,
  SOURCE_LABELS,
  SOURCE_COLORS,
  UNIFIED_STATUS_LABELS,
  UNIFIED_STATUS_COLORS,
} from "./types";

type InboxListItemProps = {
  item: InboxItem;
  isSelected: boolean;
  onSelect: () => void;
};

export function InboxListItem({ item, isSelected, onSelect }: InboxListItemProps) {
  return (
    <motion.button
      onClick={onSelect}
      whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
      className={`w-full p-4 text-left transition-all border-l-4 ${
        isSelected
          ? "border-brand-light bg-white/10"
          : "border-transparent hover:border-white/20"
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <p className="font-semibold text-white text-sm truncate">{item.name}</p>
        <span
          className={`text-[10px] font-medium px-1.5 py-0.5 rounded border flex-shrink-0 ${SOURCE_COLORS[item.source]}`}
        >
          {SOURCE_LABELS[item.source]}
        </span>
      </div>
      <p className="text-xs text-gray-400 truncate">{item.email}</p>
      <div className="flex items-center justify-between mt-2">
        <span
          className={`text-xs font-medium px-2 py-1 rounded border ${UNIFIED_STATUS_COLORS[item.unifiedStatus]}`}
        >
          {UNIFIED_STATUS_LABELS[item.unifiedStatus]}
        </span>
        <span className="text-xs text-gray-500">
          {new Date(item.createdAt).toLocaleDateString()}
        </span>
      </div>
    </motion.button>
  );
}
