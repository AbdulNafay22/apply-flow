# ApplyFlow

A job application tracker for students and early-career developers. Track every co-op, internship or job application through a pipeline, keep your profile and documents in one place, and paste in a job posting to get AI-tailored resume bullets and a cover letter draft.

## Features

- **Accounts and private data:** email and password sign-in through Supabase Auth. Every user only ever sees their own rows, enforced in the database with row-level security.
- **Application pipeline:** track applications through five stages (Saved, Applied, Interviewing, Offer, Rejected) with company, role, location, job URL, salary range, job description and notes.
- **Search and dashboard:** search by company or role, and see counts per stage at a glance.
- **Profile and documents:** store your school, program, skills, links and summary, and upload documents to a private storage bucket.
- **Tailor (AI):** paste a job posting and get keywords, the skills from your profile that match, 4-5 tailored resume bullets and a three-paragraph cover letter draft. The bullets are generated only from what is in your profile.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui (Radix) |
| Backend | Supabase: PostgreSQL, Auth, Storage, Edge Functions (Deno) |
| AI | Google Gemini 2.5 Flash, called from the Edge Function |
| Quality | ESLint, Vitest and Testing Library, GitHub Actions CI |

## Architecture

```
React app (Vite)
   |-- supabase-js --> Auth, PostgreSQL (RLS), Storage
   '-- functions.invoke("tailor-content") --> Edge Function --> Gemini API
```

- **Database:** two tables, `profiles` and `applications`, plus a private `documents` bucket. Migrations are in `supabase/migrations`. Row-level security policies limit every table and the storage bucket to the signed-in owner (11 policies in total). A trigger creates a profile row on sign-up and another keeps `updated_at` current.
- **Edge Function (`supabase/functions/tailor-content`):** keeps the Gemini API key server-side. It rejects requests that are not from a signed-in user (`401`), validates the posting length, asks Gemini for a strict JSON response, and normalises the result before returning it.
- **Client:** protected routes redirect signed-out users to the sign-in page.

## Getting started

Requirements: Node 20+, a free [Supabase](https://supabase.com) project, and a free [Gemini API key](https://aistudio.google.com/apikey).

```bash
git clone https://github.com/AbdulNafay22/apply-flow.git
cd apply-flow
npm install
cp .env.example .env          # then fill in your Supabase values
npm run dev                   # http://localhost:8080
```

### Set up Supabase

1. Create a project and copy the URL and publishable (anon) key into `.env`.
2. Apply the schema: run the files in `supabase/migrations` in order (SQL editor, or `supabase db push` with the CLI).
3. Deploy the Edge Function and give it your Gemini key:

```bash
supabase functions deploy tailor-content
supabase secrets set GEMINI_API_KEY=your-key-here
```

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm test` | Run the Vitest suite |
| `npm run lint` | Lint with ESLint |
| `npm run build` | Production build |

CI runs install, lint, tests and build on every push.

## Deployment

The frontend deploys as a static site. On Vercel: import the repository, keep the Vite defaults, and add `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` and `VITE_SUPABASE_PROJECT_ID` as environment variables. In Supabase, add the deployed URL under Authentication > URL Configuration.

## Roadmap

- Per-user rate limits on the Tailor function
- Signed URLs for downloading private documents (uploads work, but the stored link is a public-style URL)
- Interview date reminders
- Import postings from a job URL
- Wider test coverage for pages and data hooks
