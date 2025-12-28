import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Copy, Loader2, Check, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Profile {
  full_name: string | null;
  school: string | null;
  program: string | null;
  location: string | null;
  skills: string[] | null;
  summary: string | null;
}

interface TailorResult {
  keywords: string[];
  matchedSkills: string[];
  bulletPoints: string[];
  coverLetterDraft: string;
}

export default function Tailor() {
  const [jobPosting, setJobPosting] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [result, setResult] = useState<TailorResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, school, program, location, skills, summary")
        .eq("user_id", userData.user.id)
        .maybeSingle();

      if (error) throw error;
      setProfile(data);
    } catch (error: any) {
      console.error("Error fetching profile:", error);
    }
  };

  const handleTailor = async () => {
    if (!jobPosting.trim()) {
      toast({
        title: "Please enter a job posting",
        variant: "destructive",
      });
      return;
    }

    if (!profile?.skills?.length && !profile?.summary) {
      toast({
        title: "Profile incomplete",
        description: "Please add skills and a summary to your profile first.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("tailor-content", {
        body: {
          jobPosting,
          profile,
        },
      });

      if (error) throw error;
      setResult(data);
    } catch (error: any) {
      toast({
        title: "Error generating content",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, section: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
    toast({ title: "Copied to clipboard" });
  };

  const hasProfile = profile?.skills?.length || profile?.summary;

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Tailor</h1>
          <p className="mt-1 text-muted-foreground text-sm sm:text-base">
            Generate tailored content for your applications using AI
          </p>
        </div>

        {/* Warning if no profile */}
        {!hasProfile && (
          <Card className="border-warning/50 bg-warning/10">
            <CardContent className="flex items-center gap-3 py-4">
              <AlertCircle className="h-5 w-5 text-warning" />
              <p className="text-sm">
                Add skills and a summary to your{" "}
                <a href="/profile" className="text-primary underline">
                  profile
                </a>{" "}
                to get personalized results.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="space-y-4">
            <Card className="glass border-border/50">
              <CardHeader>
                <CardTitle>Job Posting</CardTitle>
                <CardDescription>
                  Paste the full job description below
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={jobPosting}
                  onChange={(e) => setJobPosting(e.target.value)}
                  placeholder="Paste the job posting here..."
                  className="min-h-[300px] font-mono text-sm"
                />
                <Button
                  onClick={handleTailor}
                  disabled={loading || !jobPosting.trim()}
                  className="w-full gap-2"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Generate Tailor Pack
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Profile Preview */}
            {hasProfile && (
              <Card className="glass border-border/50">
                <CardHeader>
                  <CardTitle className="text-sm">Your Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {profile?.full_name && (
                    <p className="text-sm text-foreground">{profile.full_name}</p>
                  )}
                  {profile?.program && profile?.school && (
                    <p className="text-sm text-muted-foreground">
                      {profile.program} @ {profile.school}
                    </p>
                  )}
                  {profile?.skills && profile.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {profile.skills.slice(0, 8).map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {profile.skills.length > 8 && (
                        <Badge variant="outline" className="text-xs">
                          +{profile.skills.length - 8} more
                        </Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Results Section */}
          <div className="space-y-4">
            {result ? (
              <>
                {/* Keywords */}
                <Card className="glass border-border/50">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">Keywords</CardTitle>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        copyToClipboard(result.keywords.join(", "), "keywords")
                      }
                    >
                      {copiedSection === "keywords" ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {result.keywords.map((keyword, i) => (
                        <Badge key={i} variant="outline">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Matched Skills */}
                <Card className="glass border-border/50">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">Matched Skills</CardTitle>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        copyToClipboard(result.matchedSkills.join(", "), "skills")
                      }
                    >
                      {copiedSection === "skills" ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {result.matchedSkills.map((skill, i) => (
                        <Badge key={i} className="bg-primary/20 text-primary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Bullet Points */}
                <Card className="glass border-border/50">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">Resume Bullets</CardTitle>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        copyToClipboard(
                          result.bulletPoints.map((b) => `• ${b}`).join("\n"),
                          "bullets"
                        )
                      }
                    >
                      {copiedSection === "bullets" ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {result.bulletPoints.map((bullet, i) => (
                        <li
                          key={i}
                          className="flex gap-2 text-sm text-foreground"
                        >
                          <span className="text-primary">•</span>
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Cover Letter */}
                <Card className="glass border-border/50">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">Cover Letter Draft</CardTitle>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        copyToClipboard(result.coverLetterDraft, "cover")
                      }
                    >
                      {copiedSection === "cover" ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="whitespace-pre-wrap text-sm text-foreground leading-relaxed">
                      {result.coverLetterDraft}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="glass border-border/50 h-full min-h-[400px] flex items-center justify-center">
                <CardContent className="text-center">
                  <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Paste a job posting and click generate to create your tailor
                    pack
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
