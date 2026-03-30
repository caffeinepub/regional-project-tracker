interface StatusChipProps {
  value: string;
  field?: string;
}

// Link Status colors
const LINK_STATUS_COLORS: Record<string, string> = {
  Draft: "bg-amber-100 text-amber-700 border border-amber-300",
  Live: "bg-emerald-100 text-emerald-700 border border-emerald-300",
  Closed: "bg-slate-100 text-slate-600 border border-slate-300",
};

// Data Status / Quota Status colors
const GENERAL_STATUS_COLORS: Record<string, string> = {
  Pending: "bg-amber-100 text-amber-700",
  WIP: "bg-blue-100 text-blue-700",
  Completed: "bg-emerald-100 text-emerald-700",
  "Not Received": "bg-red-100 text-red-700",
  Programming: "bg-purple-100 text-purple-700",
  "Test link delivered": "bg-sky-100 text-sky-700",
  "Changes Phase": "bg-orange-100 text-orange-700",
  // Legacy
  Active: "bg-emerald-100 text-emerald-700",
  Complete: "bg-blue-100 text-blue-700",
  Inactive: "bg-red-100 text-red-700",
  "N/A": "bg-gray-100 text-gray-600",
};

export function StatusChip({ value, field }: StatusChipProps) {
  let cls: string;
  if (field === "linkStatus" || LINK_STATUS_COLORS[value]) {
    cls = LINK_STATUS_COLORS[value] ?? "bg-gray-100 text-gray-600";
  } else {
    cls = GENERAL_STATUS_COLORS[value] ?? "bg-gray-100 text-gray-600";
  }
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${cls}`}
    >
      {value || "—"}
    </span>
  );
}
