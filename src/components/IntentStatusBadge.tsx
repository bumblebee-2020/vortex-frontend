import type { IntentStatus } from "@/lib/types";

const STATUS_STYLES: Record<IntentStatus, string> = {
  pending: "bg-vx-lav-bg text-vx-lav border-vx-lav/60",
  accepted: "bg-blue-500/10 text-blue-300 border-blue-500/80",
  filled: "bg-vx-sage-bg text-vx-sage border-vx-sage/50",
  failed: "bg-red-500/10 text-red-300 border-red-500/80",
};

export function IntentStatusBadge({ status }: { status: IntentStatus }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border capitalize ${STATUS_STYLES[status]}`}
    >
      {status}
    </span>
  );
}
