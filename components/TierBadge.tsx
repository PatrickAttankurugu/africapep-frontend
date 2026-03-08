import { tierColor, tierLabel } from "@/lib/api";

export default function TierBadge({ tier }: { tier: number }) {
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${tierColor(tier)}`}>
      {tierLabel(tier)}
    </span>
  );
}
