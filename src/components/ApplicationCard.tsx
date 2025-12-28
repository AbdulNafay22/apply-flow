import { StatusBadge } from "./StatusBadge";
import { MapPin, ExternalLink } from "lucide-react";
import { format } from "date-fns";

interface ApplicationCardProps {
  id: string;
  company: string;
  position: string;
  location?: string | null;
  status: "saved" | "applied" | "interviewing" | "offer" | "rejected";
  createdAt: string;
  jobUrl?: string | null;
  onClick: () => void;
}

export function ApplicationCard({
  company,
  position,
  location,
  status,
  createdAt,
  jobUrl,
  onClick,
}: ApplicationCardProps) {
  return (
    <div className="application-card" onClick={onClick}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">{position}</h3>
          <p className="text-sm text-muted-foreground truncate">{company}</p>
        </div>
        {jobUrl && (
          <a
            href={jobUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        )}
      </div>
      
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {location && (
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span className="truncate max-w-[120px]">{location}</span>
            </div>
          )}
        </div>
        <StatusBadge status={status} />
      </div>
      
      <p className="mt-2 text-xs text-muted-foreground">
        Added {format(new Date(createdAt), "MMM d, yyyy")}
      </p>
    </div>
  );
}
