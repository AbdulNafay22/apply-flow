import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, ExternalLink } from "lucide-react";

type ApplicationStatus = "saved" | "applied" | "interviewing" | "offer" | "rejected";

interface Application {
  id: string;
  company: string;
  position: string;
  location: string | null;
  job_url: string | null;
  status: ApplicationStatus;
  salary_range: string | null;
  job_description: string | null;
  notes: string | null;
  applied_at: string | null;
  interview_date: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
}

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: Application | null;
  isCreating: boolean;
  onSave: (data: Partial<Application>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onStatusChange: (id: string, status: ApplicationStatus) => Promise<void>;
}

export function ApplicationModal({
  isOpen,
  onClose,
  application,
  isCreating,
  onSave,
  onDelete,
  onStatusChange,
}: ApplicationModalProps) {
  const [formData, setFormData] = useState({
    company: "",
    position: "",
    location: "",
    job_url: "",
    status: "saved" as ApplicationStatus,
    salary_range: "",
    job_description: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (application) {
      setFormData({
        company: application.company,
        position: application.position,
        location: application.location || "",
        job_url: application.job_url || "",
        status: application.status,
        salary_range: application.salary_range || "",
        job_description: application.job_description || "",
        notes: application.notes || "",
      });
    } else {
      setFormData({
        company: "",
        position: "",
        location: "",
        job_url: "",
        status: "saved",
        salary_range: "",
        job_description: "",
        notes: "",
      });
    }
  }, [application, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(formData);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (application && confirm("Are you sure you want to delete this application?")) {
      await onDelete(application.id);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <DialogHeader>
          <DialogTitle>
            {isCreating ? "Add Application" : "Edit Application"}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {isCreating ? "Track a new job opportunity" : "Update application details"}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company">Company *</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) =>
                  setFormData({ ...formData, company: e.target.value })
                }
                placeholder="e.g., Google"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="position">Position *</Label>
              <Input
                id="position"
                value={formData.position}
                onChange={(e) =>
                  setFormData({ ...formData, position: e.target.value })
                }
                placeholder="e.g., Software Engineer Intern"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                placeholder="e.g., San Francisco, CA"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: ApplicationStatus) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="saved">Saved</SelectItem>
                  <SelectItem value="applied">Applied</SelectItem>
                  <SelectItem value="interviewing">Interviewing</SelectItem>
                  <SelectItem value="offer">Offer</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="job_url">Job URL</Label>
              <div className="relative">
                <Input
                  id="job_url"
                  value={formData.job_url}
                  onChange={(e) =>
                    setFormData({ ...formData, job_url: e.target.value })
                  }
                  placeholder="https://..."
                />
                {formData.job_url && (
                  <a
                    href={formData.job_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="salary_range">Salary Range</Label>
              <Input
                id="salary_range"
                value={formData.salary_range}
                onChange={(e) =>
                  setFormData({ ...formData, salary_range: e.target.value })
                }
                placeholder="e.g., $60k-$80k"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="job_description">Job Description</Label>
            <Textarea
              id="job_description"
              value={formData.job_description}
              onChange={(e) =>
                setFormData({ ...formData, job_description: e.target.value })
              }
              placeholder="Paste the job description here..."
              className="min-h-[120px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Any additional notes..."
              className="min-h-[80px]"
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            {!isCreating && application && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : isCreating ? "Add Application" : "Save Changes"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}