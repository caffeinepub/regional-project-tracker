interface StatusChipProps {
  value: string;
}

const colorMap: Record<string, string> = {
  Active: "bg-emerald-100 text-emerald-700",
  Complete: "bg-blue-100 text-blue-700",
  Pending: "bg-amber-100 text-amber-700",
  Inactive: "bg-red-100 text-red-700",
  "N/A": "bg-gray-100 text-gray-600",
};

export function StatusChip({ value }: StatusChipProps) {
  const cls = colorMap[value] ?? "bg-gray-100 text-gray-600";
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${cls}`}
    >
      {value || "—"}
    </span>
  );
}
