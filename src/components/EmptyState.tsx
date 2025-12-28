import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center animate-in">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <Icon className="h-8 w-8 text-primary" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm max-w-xs mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="gap-2">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

interface EmptyColumnProps {
  status: string;
}

export function EmptyColumn({ status }: EmptyColumnProps) {
  const messages: Record<string, string> = {
    saved: "Save jobs you're interested in",
    applied: "Track submitted applications",
    interviewing: "Manage your interviews",
    offer: "Celebrate your offers!",
    rejected: "Learn from rejections",
  };

  return (
    <div className="flex flex-col items-center justify-center py-8 px-2 text-center">
      <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center mb-3">
        <div className="w-3 h-3 rounded-full bg-muted-foreground/30" />
      </div>
      <p className="text-muted-foreground text-xs">
        {messages[status] || "No applications"}
      </p>
    </div>
  );
}
