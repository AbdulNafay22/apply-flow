import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { supabase } from "@/integrations/supabase/client";
import { Briefcase, CheckCircle, Clock, XCircle, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

type ApplicationStatus = "saved" | "applied" | "interviewing" | "offer" | "rejected";

interface StatusCount {
  saved: number;
  applied: number;
  interviewing: number;
  offer: number;
  rejected: number;
}

interface RecentApplication {
  id: string;
  company: string;
  position: string;
  status: ApplicationStatus;
  created_at: string;
}

export default function Dashboard() {
  const [statusCounts, setStatusCounts] = useState<StatusCount>({
    saved: 0,
    applied: 0,
    interviewing: 0,
    offer: 0,
    rejected: 0,
  });
  const [recentApplications, setRecentApplications] = useState<RecentApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data: applications, error } = await supabase
        .from("applications")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const counts: StatusCount = {
        saved: 0,
        applied: 0,
        interviewing: 0,
        offer: 0,
        rejected: 0,
      };

      applications?.forEach((app) => {
        counts[app.status as ApplicationStatus]++;
      });

      setStatusCounts(counts);
      setRecentApplications(applications?.slice(0, 5) || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalApplications = Object.values(statusCounts).reduce((a, b) => a + b, 0);

  const stats = [
    {
      name: "Total Applications",
      value: totalApplications,
      icon: Briefcase,
      color: "text-primary",
    },
    {
      name: "Applied",
      value: statusCounts.applied,
      icon: TrendingUp,
      color: "text-primary",
    },
    {
      name: "Interviewing",
      value: statusCounts.interviewing,
      icon: Clock,
      color: "text-warning",
    },
    {
      name: "Offers",
      value: statusCounts.offer,
      icon: CheckCircle,
      color: "text-success",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 sm:space-y-8 animate-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="mt-1 text-muted-foreground text-sm sm:text-base">
            Track your co-op application progress
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.name} className="glass border-border/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                  {stat.name}
                </CardTitle>
                <stat.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                <div className="text-2xl sm:text-3xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pipeline Overview */}
        <Card className="glass border-border/50">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="text-base sm:text-lg">Pipeline Overview</CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="grid grid-cols-5 gap-2 sm:gap-4">
              {(["saved", "applied", "interviewing", "offer", "rejected"] as const).map(
                (status) => (
                  <div
                    key={status}
                    className="flex flex-col items-center p-2 sm:p-4 rounded-lg bg-secondary/30"
                  >
                    <StatusBadge status={status} />
                    <span className="mt-1 sm:mt-2 text-lg sm:text-2xl font-bold">
                      {statusCounts[status]}
                    </span>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Applications */}
        <Card className="glass border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Applications</CardTitle>
            <Link
              to="/applications"
              className="text-sm text-primary hover:underline"
            >
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading...
              </div>
            ) : recentApplications.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No applications yet</p>
                <Link
                  to="/applications"
                  className="mt-2 inline-block text-primary hover:underline"
                >
                  Add your first application
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentApplications.map((app) => (
                  <div
                    key={app.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                  >
                    <div>
                      <p className="font-medium">{app.position}</p>
                      <p className="text-sm text-muted-foreground">{app.company}</p>
                    </div>
                    <StatusBadge status={app.status as ApplicationStatus} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
