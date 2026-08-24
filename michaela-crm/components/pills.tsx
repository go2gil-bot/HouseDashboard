const STATUS_STYLES: Record<string, string> = {
  Confirmed: "bg-teal-soft text-teal",
  "Checked-in": "bg-teal-soft text-teal",
  Landed: "bg-teal-soft text-teal",
  Pending: "bg-gold-soft text-[#8a6d10]",
  Delayed: "bg-gold-soft text-[#8a6d10]",
  Scheduled: "bg-gold-soft text-[#8a6d10]",
  Cancelled: "bg-red-50 text-red-700",
  "Checked-out": "bg-gray-100 text-gray-600",
};

export function StatusPill({ status }: { status: string }) {
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs ${
        STATUS_STYLES[status] ?? "bg-gray-100 text-gray-600"
      }`}
    >
      {status}
    </span>
  );
}

export function TierBadge({ tier }: { tier: string }) {
  return (
    <span className="rounded-full border border-gold px-2.5 py-0.5 text-xs text-[#8a6d10]">
      {tier}
    </span>
  );
}
