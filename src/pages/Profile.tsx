import { useEffect, useState, useRef } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Save, Plus, X, Loader2, Upload, FileText, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  school: string | null;
  program: string | null;
  location: string | null;
  skills: string[] | null;
  summary: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  portfolio_url: string | null;
  resume_url: string | null;
  cover_letter_url: string | null;
}

export default function Profile() {
  const [profile, setProfile] = useState<Partial<Profile>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [uploadingResume, setUploadingResume] = useState(false);
  const [uploadingCoverLetter, setUploadingCoverLetter] = useState(false);
  const resumeInputRef = useRef<HTMLInputElement>(null);
  const coverLetterInputRef = useRef<HTMLInputElement>(null);
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
        .select("*")
        .eq("user_id", userData.user.id)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setProfile(data);
      }
    } catch (error: any) {
      toast({
        title: "Error fetching profile",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("profiles")
        .upsert({
          user_id: userData.user.id,
          ...profile,
        });

      if (error) throw error;
      toast({ title: "Profile saved successfully" });
    } catch (error: any) {
      toast({
        title: "Error saving profile",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim()) {
      const currentSkills = profile.skills || [];
      if (!currentSkills.includes(newSkill.trim())) {
        setProfile({
          ...profile,
          skills: [...currentSkills, newSkill.trim()],
        });
      }
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setProfile({
      ...profile,
      skills: (profile.skills || []).filter((skill) => skill !== skillToRemove),
    });
  };

  const uploadFile = async (
    file: File,
    type: "resume" | "cover_letter"
  ): Promise<string | null> => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");

      const fileExt = file.name.split(".").pop();
      const fileName = `${userData.user.id}/${type}_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("documents")
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (error: any) {
      toast({
        title: `Error uploading ${type}`,
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingResume(true);
    const url = await uploadFile(file, "resume");
    if (url) {
      setProfile({ ...profile, resume_url: url });
      toast({ title: "Resume uploaded successfully" });
    }
    setUploadingResume(false);
    if (resumeInputRef.current) resumeInputRef.current.value = "";
  };

  const handleCoverLetterUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCoverLetter(true);
    const url = await uploadFile(file, "cover_letter");
    if (url) {
      setProfile({ ...profile, cover_letter_url: url });
      toast({ title: "Cover letter uploaded successfully" });
    }
    setUploadingCoverLetter(false);
    if (coverLetterInputRef.current) coverLetterInputRef.current.value = "";
  };

  const handleRemoveDocument = (type: "resume" | "cover_letter") => {
    if (type === "resume") {
      setProfile({ ...profile, resume_url: null });
    } else {
      setProfile({ ...profile, cover_letter_url: null });
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in max-w-3xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Profile</h1>
            <p className="mt-1 text-muted-foreground">
              Your information for tailored applications
            </p>
          </div>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Profile
          </Button>
        </div>

        {/* Basic Info */}
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={profile.full_name || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, full_name: e.target.value })
                  }
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={profile.location || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, location: e.target.value })
                  }
                  placeholder="San Francisco, CA"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="school">School</Label>
                <Input
                  id="school"
                  value={profile.school || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, school: e.target.value })
                  }
                  placeholder="University of Waterloo"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="program">Program</Label>
                <Input
                  id="program"
                  value={profile.program || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, program: e.target.value })
                  }
                  placeholder="Computer Science"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Skills */}
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle>Skills</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add a skill..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
              />
              <Button type="button" onClick={handleAddSkill} variant="secondary">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(profile.skills || []).map((skill) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="gap-1 px-3 py-1"
                >
                  {skill}
                  <button
                    onClick={() => handleRemoveSkill(skill)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              {(profile.skills || []).length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No skills added yet. Add skills that you want to highlight in your applications.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle>Professional Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={profile.summary || ""}
              onChange={(e) =>
                setProfile({ ...profile, summary: e.target.value })
              }
              placeholder="Write a brief summary about yourself, your experience, and what you're looking for..."
              className="min-h-[150px]"
            />
          </CardContent>
        </Card>

        {/* Links */}
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle>Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="linkedin_url">LinkedIn</Label>
              <Input
                id="linkedin_url"
                value={profile.linkedin_url || ""}
                onChange={(e) =>
                  setProfile({ ...profile, linkedin_url: e.target.value })
                }
                placeholder="https://linkedin.com/in/username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="github_url">GitHub</Label>
              <Input
                id="github_url"
                value={profile.github_url || ""}
                onChange={(e) =>
                  setProfile({ ...profile, github_url: e.target.value })
                }
                placeholder="https://github.com/username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="portfolio_url">Portfolio</Label>
              <Input
                id="portfolio_url"
                value={profile.portfolio_url || ""}
                onChange={(e) =>
                  setProfile({ ...profile, portfolio_url: e.target.value })
                }
                placeholder="https://yourportfolio.com"
              />
            </div>
          </CardContent>
        </Card>

        {/* Documents */}
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle>Documents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Resume Upload */}
            <div className="space-y-2">
              <Label>Resume</Label>
              <input
                type="file"
                ref={resumeInputRef}
                onChange={handleResumeUpload}
                accept=".pdf,.doc,.docx"
                className="hidden"
              />
              {profile.resume_url ? (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border">
                  <FileText className="h-5 w-5 text-primary" />
                  <a
                    href={profile.resume_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-sm text-foreground hover:text-primary truncate"
                  >
                    View Resume
                  </a>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveDocument("resume")}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => resumeInputRef.current?.click()}
                  disabled={uploadingResume}
                  className="w-full gap-2"
                >
                  {uploadingResume ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  {uploadingResume ? "Uploading..." : "Upload Resume"}
                </Button>
              )}
            </div>

            {/* Cover Letter Upload */}
            <div className="space-y-2">
              <Label>Cover Letter Template</Label>
              <input
                type="file"
                ref={coverLetterInputRef}
                onChange={handleCoverLetterUpload}
                accept=".pdf,.doc,.docx"
                className="hidden"
              />
              {profile.cover_letter_url ? (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border">
                  <FileText className="h-5 w-5 text-primary" />
                  <a
                    href={profile.cover_letter_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-sm text-foreground hover:text-primary truncate"
                  >
                    View Cover Letter
                  </a>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveDocument("cover_letter")}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => coverLetterInputRef.current?.click()}
                  disabled={uploadingCoverLetter}
                  className="w-full gap-2"
                >
                  {uploadingCoverLetter ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  {uploadingCoverLetter ? "Uploading..." : "Upload Cover Letter"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
