import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApplicationCard } from "@/components/ApplicationCard";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Briefcase } from "lucide-react";
import { ApplicationModal } from "@/components/ApplicationModal";
import { SkeletonPipeline } from "@/components/SkeletonCard";
import { EmptyState, EmptyColumn } from "@/components/EmptyState";

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

const statusOrder: ApplicationStatus[] = ["saved", "applied", "interviewing", "offer", "rejected"];

const statusLabels: Record<ApplicationStatus, string> = {
  saved: "Saved",
  applied: "Applied",
  interviewing: "Interviewing",
  offer: "Offer",
  rejected: "Rejected",
};

export default function Applications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from("applications")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching applications",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (application?: Application) => {
    if (application) {
      setSelectedApplication(application);
      setIsCreating(false);
    } else {
      setSelectedApplication(null);
      setIsCreating(true);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedApplication(null);
    setIsCreating(false);
  };

  const handleSave = async (data: Partial<Application>) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");

      if (isCreating) {
        const { error } = await supabase.from("applications").insert([{
          company: data.company!,
          position: data.position!,
          location: data.location,
          job_url: data.job_url,
          status: data.status,
          salary_range: data.salary_range,
          job_description: data.job_description,
          notes: data.notes,
          user_id: userData.user.id,
        }]);
        if (error) throw error;
        toast({ title: "Application added successfully" });
      } else if (selectedApplication) {
        const { error } = await supabase
          .from("applications")
          .update(data)
          .eq("id", selectedApplication.id);
        if (error) throw error;
        toast({ title: "Application updated successfully" });
      }
      handleCloseModal();
      fetchApplications();
    } catch (error: any) {
      toast({
        title: "Error saving application",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("applications").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Application deleted" });
      handleCloseModal();
      fetchApplications();
    } catch (error: any) {
      toast({
        title: "Error deleting application",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (id: string, newStatus: ApplicationStatus) => {
    try {
      const { error } = await supabase
        .from("applications")
        .update({ status: newStatus })
        .eq("id", id);
      if (error) throw error;
      fetchApplications();
    } catch (error: any) {
      toast({
        title: "Error updating status",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const filteredApplications = applications.filter(
    (app) =>
      app.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.position.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedApplications = statusOrder.reduce((acc, status) => {
    acc[status] = filteredApplications.filter((app) => app.status === status);
    return acc;
  }, {} as Record<ApplicationStatus, Application[]>);

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Applications</h1>
            <p className="mt-1 text-muted-foreground text-sm sm:text-base">
              Manage your job applications pipeline
            </p>
          </div>
          <Button onClick={() => handleOpenModal()} className="gap-2 w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            Add Application
          </Button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by company or position..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Pipeline Board */}
        {loading ? (
          <div className="overflow-x-auto pb-4">
            <SkeletonPipeline />
          </div>
        ) : applications.length === 0 && !searchQuery ? (
          <EmptyState
            icon={Briefcase}
            title="No applications yet"
            description="Start tracking your job applications by adding your first one. Stay organized throughout your job search."
            actionLabel="Add Your First Application"
            onAction={() => handleOpenModal()}
          />
        ) : (
          <div className="overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="flex gap-3 sm:gap-4 min-w-max">
              {statusOrder.map((status) => (
                <div key={status} className="pipeline-column min-w-[260px] sm:min-w-[280px]">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-foreground text-sm sm:text-base">
                      {statusLabels[status]}
                    </h3>
                    <span className="text-xs sm:text-sm text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      {groupedApplications[status].length}
                    </span>
                  </div>
                  <div className="space-y-3 flex-1">
                    {groupedApplications[status].length === 0 ? (
                      <EmptyColumn status={status} />
                    ) : (
                      groupedApplications[status].map((app) => (
                        <ApplicationCard
                          key={app.id}
                          id={app.id}
                          company={app.company}
                          position={app.position}
                          location={app.location}
                          status={app.status}
                          createdAt={app.created_at}
                          jobUrl={app.job_url}
                          onClick={() => handleOpenModal(app)}
                        />
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <ApplicationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        application={selectedApplication}
        isCreating={isCreating}
        onSave={handleSave}
        onDelete={handleDelete}
        onStatusChange={handleStatusChange}
      />
    </DashboardLayout>
  );
}
