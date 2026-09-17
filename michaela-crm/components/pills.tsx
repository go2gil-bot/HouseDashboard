import { t } from "@/lib/i18n";

// Status colours are the design system's four ground/ink pairs — nothing here
// picks a colour outside them, and an unmapped status falls back to neutral.
const STATUS_STYLES: Record<string, string> = {
  Confirmed: "bg-teal-soft text-teal",
  "Checked-in": "bg-teal-soft text-teal",
  Landed: "bg-teal-soft text-teal",
  Pending: "bg-gold-soft text-gold-ink",
  Delayed: "bg-gold-soft text-gold-ink",
  Scheduled: "bg-gold-soft text-gold-ink",
  Cancelled: "bg-danger-soft text-danger-ink",
  "Checked-out": "bg-neutral-soft text-neutral-ink",
};

export function StatusPill({ status }: { status: string }) {
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs ${
        STATUS_STYLES[status] ?? "bg-neutral-soft text-neutral-ink"
      }`}
    >
      {t.status[status] ?? status}
    </span>
  );
}

export function TierBadge({ tier }: { tier: string }) {
  return (
    <span className="rounded-full border border-gold px-2.5 py-0.5 text-xs text-gold-ink">
      {t.tier[tier] ?? tier}
    </span>
  );
}
