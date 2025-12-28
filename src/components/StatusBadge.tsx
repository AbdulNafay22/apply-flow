import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "saved" | "applied" | "interviewing" | "offer" | "rejected";
  className?: string;
}

const statusConfig = {
  saved: {
    label: "Saved",
    className: "status-saved",
  },
  applied: {
    label: "Applied",
    className: "status-applied",
  },
  interviewing: {
    label: "Interviewing",
    className: "status-interviewing",
  },
  offer: {
    label: "Offer",
    className: "status-offer",
  },
  rejected: {
    label: "Rejected",
    className: "status-rejected",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <span className={cn("status-badge", config.className, className)}>
      {config.label}
    </span>
  );
}
