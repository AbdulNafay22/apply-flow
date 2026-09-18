import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
const MIN_POSTING_CHARS = 20;
const MAX_POSTING_CHARS = 15000;

const SYSTEM_PROMPT = `You are an expert career coach helping students tailor their job applications.
Given a job posting and a candidate's profile, generate:
1. keywords: Key terms and skills from the job posting (array of strings, 5-10 items)
2. matchedSkills: Skills from the candidate's profile that match the job (array of strings)
3. bulletPoints: 4-5 achievement-oriented resume bullet points tailored to this job. Only use facts present in the candidate's profile; never invent experience or numbers.
4. coverLetterDraft: A professional cover letter draft (3 paragraphs)

Respond ONLY with valid JSON in this exact format:
{
  "keywords": ["keyword1", "keyword2"],
  "matchedSkills": ["skill1", "skill2"],
  "bulletPoints": ["bullet1", "bullet2"],
  "coverLetterDraft": "Dear Hiring Manager,\\n\\n..."
}`;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((v) => String(v).trim()).filter((v) => v.length > 0);
}

function parseModelJson(content: string): Record<string, unknown> {
  try {
    return JSON.parse(content);
  } catch {
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Could not parse AI response as JSON");
    return JSON.parse(match[0]);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  try {
    // Only signed-in users may call this function (protects the Gemini quota).
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } } },
    );
    const { data: userData, error: authError } = await supabase.auth.getUser();
    if (authError || !userData?.user) {
      return json({ error: "Unauthorized" }, 401);
    }

    const { jobPosting, profile } = await req.json();
    if (typeof jobPosting !== "string" || jobPosting.trim().length < MIN_POSTING_CHARS) {
      return json({ error: `Job posting must be at least ${MIN_POSTING_CHARS} characters` }, 400);
    }
    if (jobPosting.length > MAX_POSTING_CHARS) {
      return json({ error: `Job posting must be under ${MAX_POSTING_CHARS} characters` }, 400);
    }

    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");

    const userPrompt = `Job Posting:
${jobPosting}

Candidate Profile:
Name: ${profile?.full_name || "Not provided"}
School: ${profile?.school || "Not provided"}
Program: ${profile?.program || "Not provided"}
Location: ${profile?.location || "Not provided"}
Skills: ${profile?.skills?.join(", ") || "Not provided"}
Summary: ${profile?.summary || "Not provided"}`;

    const response = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.4 },
      }),
    });

    if (!response.ok) {
      console.error("Gemini API error:", response.status, await response.text());
      if (response.status === 429) {
        return json({ error: "Rate limit exceeded. Please try again later." }, 429);
      }
      return json({ error: "The AI service failed. Please try again." }, 502);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!content) throw new Error("No content in AI response");

    const parsed = parseModelJson(content);
    return json({
      keywords: toStringArray(parsed.keywords),
      matchedSkills: toStringArray(parsed.matchedSkills),
      bulletPoints: toStringArray(parsed.bulletPoints),
      coverLetterDraft: typeof parsed.coverLetterDraft === "string" ? parsed.coverLetterDraft : "",
    });
  } catch (error: unknown) {
    console.error("Error in tailor-content function:", error);
    const message = error instanceof Error ? error.message : "An unexpected error occurred";
    return json({ error: message }, 500);
  }
});
