import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { jobPosting, profile } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert career coach helping students tailor their job applications. 
Given a job posting and a candidate's profile, generate:
1. keywords: Key terms and skills from the job posting (array of strings, 5-10 items)
2. matchedSkills: Skills from the candidate's profile that match the job (array of strings)
3. bulletPoints: 4-5 achievement-oriented resume bullet points tailored to this job
4. coverLetterDraft: A professional cover letter draft (3 paragraphs)

Respond ONLY with valid JSON in this exact format:
{
  "keywords": ["keyword1", "keyword2"],
  "matchedSkills": ["skill1", "skill2"],
  "bulletPoints": ["bullet1", "bullet2"],
  "coverLetterDraft": "Dear Hiring Manager,\\n\\n..."
}`;

    const userPrompt = `Job Posting:
${jobPosting}

Candidate Profile:
Name: ${profile?.full_name || "Not provided"}
School: ${profile?.school || "Not provided"}
Program: ${profile?.program || "Not provided"}
Location: ${profile?.location || "Not provided"}
Skills: ${profile?.skills?.join(", ") || "Not provided"}
Summary: ${profile?.summary || "Not provided"}`;

    console.log("Calling AI gateway...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not parse AI response as JSON");
    }

    const result = JSON.parse(jsonMatch[0]);
    console.log("Successfully generated tailor pack");

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error in tailor-content function:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
